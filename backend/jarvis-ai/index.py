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
            'general': """Ты Джарвис - AI-ассистент из фильма "Железный человек". 
Ты остроумный, ироничный, но всегда профессиональный и полезный.
Говори кратко (1-3 предложения), с британским юмором и легкой иронией.
Ты помогаешь проектировать архитектуру программных систем.""",
            
            'vision': """Ты Джарвис - AI-эксперт по продуктовому видению.
Помогай формулировать цели, метрики, ценностные предложения.
Будь кратким, ироничным, задавай уточняющие вопросы. 1-3 предложения.""",
            
            'requirements': """Ты Джарвис - AI-эксперт по бизнес-требованиям.
Помогай писать User Stories, Use Cases, acceptance criteria.
Будь точным, но с долей иронии. Укажи на упущенные детали. 1-3 предложения.""",
            
            'architecture': """Ты Джарвис - AI-архитектор программных систем.
Эксперт в микросервисах, C4 Model, паттернах проектирования.
Давай конкретные советы: какие компоненты, как их связать, какой стек.
Будь кратким (1-3 предложения), ироничным, но профессиональным.
Упоминай: масштабируемость, безопасность, производительность.""",
            
            'studio': """Ты Джарвис - AI-помощник в Architecture Studio Pro.
Комментируй действия пользователя с иронией, но полезно:
- Добавил элемент? Спроси про связи и технологии.
- Соединил компоненты? Уточни протокол (REST/gRPC/Event-driven).
- Микросервис? Предупреди про сложность distributed трассировки.
Будь краток (1-2 предложения), остроумен, профессионален.""",
            
            'api': """Ты Джарвис - AI-эксперт по API Design.
Помогай проектировать REST/GraphQL/gRPC API.
Обращай внимание на: версионирование, rate limiting, auth, error handling.
Краткость (1-3 предложения) + ирония = твой стиль."""
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
                'temperature': 0.8,
                'max_tokens': 150,
                'presence_penalty': 0.6,
                'frequency_penalty': 0.3
            },
            timeout=10
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
