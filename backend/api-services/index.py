"""
API для управления сервисами в API Design Studio
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')

def handler(event, context):
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            cursor.execute('''
                SELECT 
                    s.id, s.name, s.description, s.protocol, s.base_url, 
                    s.version, s.status, s.created_at, s.updated_at,
                    COUNT(e.id) as endpoint_count
                FROM api_services s
                LEFT JOIN api_endpoints e ON s.id = e.service_id
                GROUP BY s.id
                ORDER BY s.created_at DESC
            ''')
            
            services = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'services': services}, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO api_services (
                    name, description, protocol, base_url, version, status
                ) VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body.get('name'),
                body.get('description'),
                body.get('protocol', 'REST'),
                body.get('base_url'),
                body.get('version', '1.0'),
                body.get('status', 'active')
            ))
            
            service_id = cursor.fetchone()['id']
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': service_id, 'message': 'Service created successfully'})
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParameters', {}) or {}
            service_id = path_params.get('id')
            
            if not service_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Service ID required'})
                }
            
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                UPDATE api_services SET
                    name = %s, description = %s, protocol = %s, 
                    base_url = %s, version = %s, status = %s
                WHERE id = %s
            ''', (
                body.get('name'),
                body.get('description'),
                body.get('protocol'),
                body.get('base_url'),
                body.get('version'),
                body.get('status'),
                service_id
            ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Service updated successfully'})
            }
        
        else:
            cursor.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
