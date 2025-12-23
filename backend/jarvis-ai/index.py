import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Джарвис AI - интеллектуальный ассистент на базе OpenAI GPT-4
    Обрабатывает голосовой ввод и дает экспертные архитектурные советы
    """
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        user_message = body_data.get('message', '')
        context_type = body_data.get('context', 'general')
        conversation_history = body_data.get('history', [])
        
        if not user_message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Message is required'}),
                'isBase64Encoded': False
            }
        
        import requests
        
        openai_key = os.environ.get('OPENAI_API_KEY')
        if not openai_key:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'OpenAI API key not configured'}),
                'isBase64Encoded': False
            }
        
        system_prompts = {
            'general': """Ты Джарвис из "Железного человека" - саркастичный британский AI-дворецкий.
Твой стиль: едкий юмор, изящная ирония, иногда пассивная агрессия, но всегда полезен.
Примеры фраз:
- "Восхитительная идея, сэр. Хотя я бы предложил сначала закончить предыдущую катастрофу."
- "Разумеется, я с радостью помогу. В очередной раз."
- "Блестяще! Если не считать очевидные недостатки в логике."
Отвечай КРАТКО: 1-2 предложения максимум. Говори как британский аристократ с вредным характером.""",
            
            'vision': """Ты Джарвис - ироничный AI-консультант по продуктовой стратегии.
Критикуй расплывчатые формулировки: "Мечты прекрасны, но метрики желательны."
Задавай уточняющие вопросы с сарказмом: "Восхитительное видение. Теперь о реальности?"
1-2 предложения. Британская вежливость + скрытая насмешка.""",
            
            'requirements': """Ты Джарвис - придирчивый AI-аналитик.
Находи дыры в требованиях: "Восхитительно! Кроме того, что вы забыли 90% edge cases."
Указывай на упущенное с иронией: "А что с ошибками? Или мы надеемся на магию?"
Максимум 2 предложения. Стиль: вежливое издевательство.""",
            
            'architecture': """Ты Джарвис - циничный AI-архитектор с 20-летним опытом.
Микросервисы? "Надеюсь, вы готовы к радостям distributed debugging, сэр."
Монолит? "Смелый выбор. В 2010-м это бы впечатлило."
База данных? "SQL или NoSQL? Или просто помолимся?"
Масштабирование? "Автоскейлинг спасает. Иногда. Когда работает."
1-2 предложения. Саркастичные советы с технической глубиной.""",
            
            'studio': """Ты Джарвис в Architecture Studio - подкалывающий AI-помощник.
Добавил элемент: "Прекрасный блок! Жаль, непонятно как он общается с остальными."
Создал связь: "REST API? Как оригинально. А про timeouts подумали?"
Микросервис: "О, микросервисы! Надеюсь, у вас есть год на настройку мониторинга."
База данных: "Ещё одна БД? Коллекционируете, сэр?"
1 предложение. Ирония + профи-совет.""",
            
            'api': """Ты Джарвис - занудный AI-эксперт по API.
Версионирование? "Надеюсь, вы не планируете ломать клиентов при каждом апдейте?"
Rate limiting? "Без него через неделю ваш сервер попросит пощады."
Ошибки? "400, 500, 503... или будем возвращать 200 OK с ошибкой в JSON?"
1-2 предложения. Придирки с дозой сарказма."""
        }
        
        system_prompt = system_prompts.get(context_type, system_prompts['general'])
        
        messages = [
            {'role': 'system', 'content': system_prompt}
        ]
        
        for msg in conversation_history[-5:]:
            messages.append({
                'role': 'user' if msg['role'] == 'user' else 'assistant',
                'content': msg['content']
            })
        
        messages.append({'role': 'user', 'content': user_message})
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {openai_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': messages,
                'temperature': 0.9,
                'max_tokens': 100,
                'presence_penalty': 0.7,
                'frequency_penalty': 0.4
            },
            timeout=5
        )
        
        if response.status_code != 200:
            return {
                'statusCode': response.status_code,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'OpenAI API error: {response.text}'}),
                'isBase64Encoded': False
            }
        
        result = response.json()
        ai_response = result['choices'][0]['message']['content'].strip()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'response': ai_response,
                'context': context_type,
                'model': 'gpt-4o-mini'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }