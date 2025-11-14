import pika
import json
import os
import sys
from twilio.rest import Client
from twilio.base.exceptions import TwilioException
import logging
import sys
import consul
import time
import atexit

# Configurar logging para enviar a STDOUT y añadir etiqueta de servicio
handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter('%(message)s')
handler.setFormatter(formatter)

logger = logging.getLogger('sms')
logger.setLevel(logging.INFO)
if not logger.handlers:
    logger.addHandler(handler)

def log_json(level, message, payload=None, meta=None, logger_name='sms'):
    rec = {
        'timestamp': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
        'level': level,
        'service': 'sms',
        'host': os.environ.get('HOSTNAME') or None,
        'logger': logger_name,
        'message': message
    }
    if payload is not None:
        rec['payload'] = payload
    if meta:
        rec['meta'] = meta
    json_msg = json.dumps(rec, default=str, ensure_ascii=False)
    if level == 'INFO':
        logger.info(json_msg)
    elif level == 'WARN':
        logger.warning(json_msg)
    elif level == 'ERROR':
        logger.error(json_msg)
    else:
        logger.debug(json_msg)

# Configuración RabbitMQ
RABBIT_URL = os.environ.get('RABBITMQ_URL', 'amqp://admin:securepass@rabbitmq:5672')
EXCHANGE = os.environ.get('AUTH_EVENTS_EXCHANGE', 'auth.events')
QUEUE = os.environ.get('MESSAGING_SMS_QUEUE', 'messaging.sms.queue')
ROUTING_KEY = os.environ.get('SEND_SMS_ROUTING_KEY', 'send.sms')

# Configuración Twilio
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')

# Inicializar cliente Twilio solo si las credenciales están configuradas
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    log_json('INFO', 'Twilio configurado correctamente')
else:
    log_json('WARN', 'Twilio no configurado - solo se logearan los SMS')

def register_with_consul():
    """Registrar servicio SMS en Consul"""
    try:
        consul_host = os.environ.get('CONSUL_HOST', 'consul')
        consul_port = int(os.environ.get('CONSUL_PORT', '8500'))
        
        c = consul.Consul(host=consul_host, port=consul_port)
        
        service_id = 'sms'
        service_name = 'sms-service'
        service_port = int(os.environ.get('SMS_SERVICE_PORT', '6379'))
        
        c.agent.service.register(
            name=service_name,
            service_id=service_id,
            address='sms',
            port=service_port,
            check=consul.Check.http(
                url=f'http://sms:{service_port}/health',
                interval='10s',
                timeout='5s'
            )
        )
        
        log_json('INFO', f'Registered with Consul as {service_name} at {consul_host}:{consul_port}')
        
        # Deregistrar al salir
        def deregister():
            try:
                c.agent.service.deregister(service_id)
                log_json('INFO', 'Deregistered from Consul')
            except:
                pass
        
        atexit.register(deregister)
        
    except Exception as e:
        log_json('ERROR', 'Failed to register with Consul', payload={'error': str(e)})

def handle_sms_message(body):
    """Procesar mensaje de SMS desde RabbitMQ"""
    try:
        event_data = json.loads(body)
        log_json('INFO', 'Procesando SMS', payload=event_data)

        event_type = event_data.get('type')
        routing_key = getattr(properties, 'routing_key', '') if 'properties' in locals() else ''

        # ======================================================
        # CASO 1: Alertas de servicio (enviadas con routing key "service.alert")
        # ======================================================
        if event_type == 'service.alert' or routing_key == 'service.alert':
            service = event_data.get('service', 'unknown')
            alert_name = event_data.get('alert_name', 'Alert')
            instance = event_data.get('instance', '')
            severity = event_data.get('severity', '')
            timestamp = event_data.get('timestamp', '')

            # Generar mensaje automático para alertas
            message = (
                f"🚨 ALERTA: {alert_name}\n"
                f"Servicio: {service}\n"
                f"Severidad: {severity}\n"
                f"Instancia: {instance}\n"
                f"Tiempo: {timestamp}"
            )

            # Recipient para alertas - usar variable de entorno
            recipient = (
                os.environ.get('ALERT_SMS_RECIPIENT') or 
                os.environ.get('SMS_DEFAULT_RECIPIENT') or
                '+573001234567'  # fallback para testing
            )

            if not recipient:
                log_json(
                    'ERROR',
                    'No recipient configurado para alertas. Configure ALERT_SMS_RECIPIENT.',
                    payload=event_data
                )
                return

        # ======================================================
        # CASO 2: Notificaciones normales (SEND_SMS)
        # ======================================================
        elif event_type in ['account.created', 'security.login', 'security.password_change']:
            recipient = event_data.get('recipient')
            message = event_data.get('message')

            if not recipient:
                log_json(
                    'ERROR',
                    'Evento normal sin recipient',
                    payload=event_data
                )
                return

            if not message:
                # Construir mensaje basado en el tipo de evento
                if event_type == 'account.created':
                    message = f"¡Bienvenido! Tu cuenta ha sido creada exitosamente."
                elif event_type == 'security.login':
                    ip = event_data.get('ip', 'IP desconocida')
                    message = f"Alerta: Nuevo acceso a tu cuenta desde {ip}"
                elif event_type == 'security.password_change':
                    message = f"Tu contraseña ha sido cambiada exitosamente"

        # ======================================================
        # CASO 3: Mensaje directo (estructura simple)
        # ======================================================
        else:
            recipient = event_data.get('recipient') or event_data.get('to')
            message = event_data.get('message') or event_data.get('body') or event_data.get('text')

            if not recipient or not message:
                log_json(
                    'ERROR',
                    'Estructura de mensaje no reconocida',
                    payload=event_data
                )
                return

        # ======================================================
        # Enviar SMS (o simular)
        # ======================================================
        send_sms(recipient, message, event_type)

    except json.JSONDecodeError as e:
        log_json('ERROR', 'Error parseando JSON', payload={'error': str(e), 'body': body})
    except Exception as e:
        log_json('ERROR', 'Error procesando mensaje', payload={'error': str(e), 'body': body})

def send_sms(recipient, message, event_type=None):
    """Función centralizada para enviar SMS"""
    # Normalizar número
    if not recipient.startswith('+'):
        log_json('WARN', 'Número sin formato internacional', payload={'recipient': recipient})
        recipient = '+57' + recipient.lstrip('+0')

    # Twilio en modo simulado
    if not twilio_client:
        log_json(
            'INFO',
            'SMS simulado',
            payload={
                'to': recipient, 
                'message': message,
                'event_type': event_type
            }
        )
        return

    # Enviar con Twilio real
    try:
        response = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=recipient
        )
        log_json(
            'INFO',
            'SMS enviado exitosamente',
            payload={
                'to': recipient, 
                'sid': getattr(response, 'sid', None),
                'event_type': event_type
            }
        )

    except TwilioException as e:
        log_json('ERROR', 'Error de Twilio enviando SMS', payload={'to': recipient, 'error': str(e)})
    except Exception as e:
        log_json('ERROR', 'Error inesperado enviando SMS', payload={'to': recipient, 'error': str(e)})

def callback(ch, method, properties, body):
    """Callback para procesar mensajes de RabbitMQ"""
    try:
        decoded = body.decode()
        log_json('INFO', 'Mensaje recibido', payload={'raw': decoded})
        handle_sms_message(decoded)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        log_json('ERROR', 'Error en callback', payload={'error': str(e)})
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def start_consumer():
    """Iniciar consumer de RabbitMQ para SMS"""
    try:
        # Registrar en Consul
        register_with_consul()
        
        # Conectar a RabbitMQ
        log_json('INFO', 'Conectando a RabbitMQ', payload={'url': RABBIT_URL})
        connection = pika.BlockingConnection(pika.URLParameters(RABBIT_URL))
        channel = connection.channel()
        
        # Declarar exchange y queue
        channel.exchange_declare(exchange=EXCHANGE, exchange_type='topic', durable=True, auto_delete=False)
        channel.queue_declare(queue=QUEUE, durable=True)
        channel.queue_bind(exchange=EXCHANGE, queue=QUEUE, routing_key=ROUTING_KEY)
        channel.queue_bind(
            exchange=EXCHANGE, 
            queue=QUEUE, 
            routing_key='service.alert'  # ← Agregar este binding también
        )
        
        # Configurar consumer
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=QUEUE, on_message_callback=callback)
        
        log_json('INFO', 'Esperando mensajes de SMS', payload={'queue': QUEUE})
        channel.start_consuming()
        
    except pika.exceptions.AMQPConnectionError as e:
        log_json('ERROR', 'Error conectando a RabbitMQ', payload={'error': str(e)})
        sys.exit(1)
    except KeyboardInterrupt:
        log_json('INFO', 'Detenido por usuario')
        try:
            channel.stop_consuming()
            connection.close()
        except:
            pass
        sys.exit(0)
    except Exception as e:
        log_json('ERROR', 'Error inesperado', payload={'error': str(e)})
        sys.exit(1)

if __name__ == '__main__':
    start_consumer()
