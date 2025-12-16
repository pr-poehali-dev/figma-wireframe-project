import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    API для управления проектами, user stories, комментариями и архитектурными элементами
    
    GET /?action=vision - получить Vision & Goals проекта
    PUT /?action=vision - обновить Vision & Goals
    GET /?action=okrs - получить OKR проекта
    POST /?action=okrs - создать новый OKR
    GET /?action=stories - получить все User Stories
    POST /?action=stories - создать User Story
    GET /?action=comments&story_id=X - получить комментарии
    POST /?action=comments - добавить комментарий
    GET /?action=arch-elements - получить архитектурные элементы
    PUT /?action=arch-elements - обновить позицию элемента
    POST /?action=arch-elements - создать архитектурный элемент
    """
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET' and action == 'vision':
            cur.execute('''
                SELECT vision, target_audience, value_proposition, 
                       timeline, budget, success_metric
                FROM projects 
                WHERE id = 1
            ''')
            vision_data = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(vision_data) if vision_data else {}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT' and action == 'vision':
            data = json.loads(event.get('body', '{}'))
            cur.execute('''
                UPDATE projects
                SET vision = %s, target_audience = %s, value_proposition = %s,
                    timeline = %s, budget = %s, success_metric = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = 1
                RETURNING vision, target_audience, value_proposition, timeline, budget, success_metric
            ''', (
                data.get('vision', ''), 
                data.get('target_audience', ''),
                data.get('value_proposition', ''),
                data.get('timeline', ''),
                data.get('budget', ''),
                data.get('success_metric', '')
            ))
            
            updated_vision = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(updated_vision) if updated_vision else {}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'okrs':
            cur.execute('''
                SELECT id, objective, key_results, created_at, updated_at
                FROM project_okrs
                WHERE project_id = 1
                ORDER BY created_at ASC
            ''')
            okrs = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(row) for row in okrs], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'okrs':
            data = json.loads(event.get('body', '{}'))
            cur.execute('''
                INSERT INTO project_okrs (project_id, objective, key_results)
                VALUES (1, %s, %s)
                RETURNING id, objective, key_results, created_at
            ''', (data['objective'], json.dumps(data['key_results'])))
            
            new_okr = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_okr), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT' and action == 'okrs':
            data = json.loads(event.get('body', '{}'))
            cur.execute('''
                UPDATE project_okrs
                SET objective = %s, key_results = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND project_id = 1
                RETURNING id, objective, key_results, updated_at
            ''', (data['objective'], json.dumps(data['key_results']), data['id']))
            
            updated_okr = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(updated_okr) if updated_okr else {}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE' and action == 'okrs':
            okr_id = params.get('id')
            cur.execute('''
                DELETE FROM project_okrs
                WHERE id = %s AND project_id = 1
                RETURNING id
            ''', (okr_id,))
            
            deleted_okr = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': dict(deleted_okr)['id'] if deleted_okr else None}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'stories':
            cur.execute('''
                SELECT id, role, action, benefit, priority, epic, 
                       created_at, updated_at 
                FROM user_stories 
                WHERE project_id = 1
                ORDER BY created_at DESC
            ''')
            stories = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(row) for row in stories], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'stories':
            data = json.loads(event.get('body', '{}'))
            cur.execute('''
                INSERT INTO user_stories (project_id, role, action, benefit, priority, epic)
                VALUES (1, %s, %s, %s, %s, %s)
                RETURNING id, role, action, benefit, priority, epic, created_at
            ''', (data['role'], data['action'], data['benefit'], data['priority'], data.get('epic', '')))
            
            new_story = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_story), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'comments':
            story_id = params.get('story_id')
            
            cur.execute('''
                SELECT id, author, text, created_at
                FROM comments
                WHERE story_id = %s
                ORDER BY created_at ASC
            ''', (story_id,))
            
            comments = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(row) for row in comments], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'comments':
            data = json.loads(event.get('body', '{}'))
            cur.execute('''
                INSERT INTO comments (story_id, author, text)
                VALUES (%s, %s, %s)
                RETURNING id, author, text, created_at
            ''', (data['story_id'], data['author'], data['text']))
            
            new_comment = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_comment), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'arch-elements':
            cur.execute('''
                SELECT id, element_type as type, name, x_position as x, y_position as y
                FROM architecture_elements
                WHERE project_id = 1 AND canvas_type = 'context'
                ORDER BY id ASC
            ''')
            elements = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(row) for row in elements], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'arch-elements':
            data = json.loads(event.get('body', '{}'))
            cur.execute('''
                INSERT INTO architecture_elements (project_id, canvas_type, element_type, name, x_position, y_position)
                VALUES (1, 'context', %s, %s, %s, %s)
                RETURNING id, element_type as type, name, x_position as x, y_position as y
            ''', (data['type'], data['name'], data['x'], data['y']))
            
            new_element = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_element), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT' and action == 'arch-elements':
            data = json.loads(event.get('body', '{}'))
            cur.execute('''
                UPDATE architecture_elements
                SET x_position = %s, y_position = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s AND project_id = 1
                RETURNING id, element_type as type, name, x_position as x, y_position as y
            ''', (data['x'], data['y'], data['id']))
            
            updated_element = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(updated_element) if updated_element else {}, default=str),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Not found'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        cur.close()
        conn.close()