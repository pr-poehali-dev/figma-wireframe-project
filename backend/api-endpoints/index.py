"""
API для управления endpoints в API Design Studio
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            service_id = query_params.get('service_id')
            status = query_params.get('status')
            
            where_clauses = []
            params = []
            
            if service_id:
                where_clauses.append('e.service_id = %s')
                params.append(service_id)
            if status:
                where_clauses.append('e.status = %s')
                params.append(status)
            
            where_sql = ' AND '.join(where_clauses) if where_clauses else '1=1'
            
            cursor.execute(f'''
                SELECT 
                    e.id, e.service_id, e.method, e.path, e.summary, e.description,
                    e.tags, e.status, e.use_case_id, e.requirement_ids,
                    e.created_at, e.updated_at,
                    s.name as service_name
                FROM api_endpoints e
                LEFT JOIN api_services s ON e.service_id = s.id
                WHERE {where_sql}
                ORDER BY e.created_at DESC
            ''', params)
            
            endpoints = cursor.fetchall()
            
            for endpoint in endpoints:
                cursor.execute('SELECT * FROM api_parameters WHERE endpoint_id = %s', (endpoint['id'],))
                endpoint['parameters'] = cursor.fetchall()
                
                cursor.execute('SELECT * FROM api_responses WHERE endpoint_id = %s', (endpoint['id'],))
                endpoint['responses'] = cursor.fetchall()
                
                cursor.execute('SELECT * FROM api_security WHERE endpoint_id = %s', (endpoint['id'],))
                endpoint['security'] = cursor.fetchall()
                
                cursor.execute('SELECT * FROM api_rate_limiting WHERE endpoint_id = %s LIMIT 1', (endpoint['id'],))
                endpoint['rateLimiting'] = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'endpoints': endpoints}, default=str)
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                INSERT INTO api_endpoints (
                    service_id, method, path, summary, description,
                    tags, status, use_case_id, requirement_ids
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (
                body.get('service_id'),
                body.get('method'),
                body.get('path'),
                body.get('summary'),
                body.get('description'),
                body.get('tags', []),
                body.get('status', 'development'),
                body.get('use_case_id'),
                body.get('requirement_ids', [])
            ))
            
            endpoint_id = cursor.fetchone()['id']
            
            if body.get('parameters'):
                for param in body['parameters']:
                    cursor.execute('''
                        INSERT INTO api_parameters (
                            endpoint_id, name, param_in, param_type, required,
                            description, default_value, example, source
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ''', (
                        endpoint_id,
                        param['name'],
                        param['in'],
                        param['type'],
                        param.get('required', False),
                        param.get('description'),
                        param.get('default'),
                        param.get('example'),
                        param.get('source', 'manual')
                    ))
            
            if body.get('responses'):
                for resp in body['responses']:
                    cursor.execute('''
                        INSERT INTO api_responses (
                            endpoint_id, status_code, description, content_type, schema_id, example
                        ) VALUES (%s, %s, %s, %s, %s, %s)
                    ''', (
                        endpoint_id,
                        resp['statusCode'],
                        resp.get('description'),
                        resp.get('contentType', 'application/json'),
                        resp.get('schemaId'),
                        resp.get('example')
                    ))
            
            if body.get('security'):
                for sec in body['security']:
                    cursor.execute('''
                        INSERT INTO api_security (
                            endpoint_id, auth_type, scopes, description
                        ) VALUES (%s, %s, %s, %s)
                    ''', (
                        endpoint_id,
                        sec['type'],
                        sec.get('scopes', []),
                        sec.get('description')
                    ))
            
            if body.get('rateLimiting'):
                rl = body['rateLimiting']
                cursor.execute('''
                    INSERT INTO api_rate_limiting (
                        endpoint_id, enabled, limit_value, period, per_user
                    ) VALUES (%s, %s, %s, %s, %s)
                ''', (
                    endpoint_id,
                    rl.get('enabled', False),
                    rl.get('limit', 1000),
                    rl.get('period', 'hour'),
                    rl.get('perUser', True)
                ))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': endpoint_id, 'message': 'Endpoint created successfully'})
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParameters', {}) or {}
            endpoint_id = path_params.get('id')
            
            if not endpoint_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Endpoint ID required'})
                }
            
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('''
                UPDATE api_endpoints SET
                    method = %s, path = %s, summary = %s, description = %s,
                    tags = %s, status = %s, use_case_id = %s, requirement_ids = %s
                WHERE id = %s
            ''', (
                body.get('method'),
                body.get('path'),
                body.get('summary'),
                body.get('description'),
                body.get('tags', []),
                body.get('status'),
                body.get('use_case_id'),
                body.get('requirement_ids', []),
                endpoint_id
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
                'body': json.dumps({'message': 'Endpoint updated successfully'})
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
