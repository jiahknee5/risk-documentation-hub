#!/usr/bin/env python3
"""
API wrapper for the Banking Risk RAG system
Provides a command-line interface for the Next.js app to interact with
"""

import sys
import json
import argparse
from typing import Dict, List, Optional
import logging

# Set up logging
logging.basicConfig(level=logging.ERROR, format='%(message)s', stream=sys.stderr)

try:
    from banking_risk_model import BankingRiskRAG, RiskLevel
except ImportError:
    # For development, add the current directory to path
    import os
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    from banking_risk_model import BankingRiskRAG, RiskLevel

class BankingRiskAPI:
    """API wrapper for banking risk RAG system"""
    
    def __init__(self, model_path: Optional[str] = None):
        try:
            self.rag = BankingRiskRAG(model_path)
        except Exception as e:
            logging.error(f"Failed to initialize RAG system: {e}")
            # Fallback to mock mode for development
            self.rag = None
            self.mock_mode = True
        else:
            self.mock_mode = False
    
    def search(self, query: str, filters: Optional[Dict] = None, top_k: int = 10) -> Dict:
        """Perform risk-aware search"""
        try:
            if self.mock_mode:
                return self._mock_search(query, filters, top_k)
            
            # Perform actual search
            results = self.rag.search(query, filters, top_k)
            
            # Get risk alerts for top documents
            alerts = []
            for result in results[:3]:
                doc_alerts = self._get_document_alerts(result['document'])
                alerts.extend(doc_alerts)
            
            # Generate summary
            documents = [r['document'] for r in results]
            summary = self.rag.generate_risk_summary(documents)
            
            # Format response
            response = {
                'results': [
                    {
                        'document': {
                            'id': r['document'].id,
                            'title': r['document'].title,
                            'content': r['document'].content[:500],  # Truncate for response
                            'risk_level': r['document'].risk_level.value,
                            'compliance_tags': [ct.value for ct in r['document'].compliance_tags],
                            'risk_scores': r['document'].risk_scores
                        },
                        'score': r['score'],
                        'risk_relevance': r.get('risk_relevance', False)
                    }
                    for r in results
                ],
                'summary': summary,
                'alerts': alerts
            }
            
            return response
            
        except Exception as e:
            logging.error(f"Search error: {e}")
            return {
                'results': [],
                'summary': 'Search failed due to an error',
                'alerts': [{
                    'type': 'ERROR',
                    'severity': 'HIGH',
                    'description': str(e)
                }]
            }
    
    def process_document(self, doc_id: str, title: str, content: str) -> Dict:
        """Process a new document"""
        try:
            if self.mock_mode:
                return self._mock_process_document(doc_id, title, content)
            
            doc = self.rag.process_document(doc_id, title, content)
            
            return {
                'success': True,
                'document': {
                    'id': doc.id,
                    'title': doc.title,
                    'risk_level': doc.risk_level.value,
                    'compliance_tags': [ct.value for ct in doc.compliance_tags],
                    'risk_scores': doc.risk_scores
                }
            }
            
        except Exception as e:
            logging.error(f"Document processing error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _get_document_alerts(self, document) -> List[Dict]:
        """Get alerts for a specific document"""
        alerts = []
        
        if document.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
            alerts.append({
                'type': 'RISK_LEVEL',
                'severity': document.risk_level.value,
                'description': f'{document.title} has {document.risk_level.value} risk level'
            })
        
        # Check for high risk scores
        for risk_type, score in document.risk_scores.items():
            if score > 0.7:
                alerts.append({
                    'type': 'RISK_SCORE',
                    'severity': 'HIGH',
                    'description': f'{document.title} has high {risk_type} score ({score:.2f})'
                })
        
        return alerts
    
    def _mock_search(self, query: str, filters: Optional[Dict], top_k: int) -> Dict:
        """Mock search results for development"""
        mock_results = [
            {
                'document': {
                    'id': 'mock-001',
                    'title': 'Basel III Capital Requirements Policy',
                    'content': 'This document outlines the Basel III capital requirements...',
                    'risk_level': 'HIGH',
                    'compliance_tags': ['BASEL_III', 'CAPITAL_ADEQUACY'],
                    'risk_scores': {
                        'credit_risk': 0.8,
                        'market_risk': 0.6,
                        'operational_risk': 0.3
                    }
                },
                'score': 0.95,
                'risk_relevance': True
            },
            {
                'document': {
                    'id': 'mock-002',
                    'title': 'Operational Risk Management Framework',
                    'content': 'Framework for managing operational risks across the organization...',
                    'risk_level': 'MEDIUM',
                    'compliance_tags': ['SOX', 'OPERATIONAL_RISK'],
                    'risk_scores': {
                        'operational_risk': 0.7,
                        'compliance_risk': 0.5
                    }
                },
                'score': 0.82,
                'risk_relevance': True
            }
        ]
        
        return {
            'results': mock_results[:top_k],
            'summary': f'Mock search results for "{query}" - Banking Risk RAG in development mode',
            'alerts': []
        }
    
    def _mock_process_document(self, doc_id: str, title: str, content: str) -> Dict:
        """Mock document processing for development"""
        # Simple risk level detection based on keywords
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['critical', 'severe', 'high risk']):
            risk_level = 'CRITICAL'
        elif any(word in content_lower for word in ['medium', 'moderate']):
            risk_level = 'MEDIUM'
        else:
            risk_level = 'LOW'
        
        return {
            'success': True,
            'document': {
                'id': doc_id,
                'title': title,
                'risk_level': risk_level,
                'compliance_tags': ['MOCK_COMPLIANCE'],
                'risk_scores': {
                    'credit_risk': 0.5,
                    'operational_risk': 0.3
                }
            }
        }

def main():
    """Main entry point for command-line usage"""
    parser = argparse.ArgumentParser(description='Banking Risk RAG API')
    parser.add_argument('command', choices=['search', 'process'], help='Command to execute')
    parser.add_argument('--query', type=str, help='Search query')
    parser.add_argument('--filters', type=str, default='{}', help='Search filters as JSON')
    parser.add_argument('--doc-id', type=str, help='Document ID for processing')
    parser.add_argument('--title', type=str, help='Document title')
    parser.add_argument('--content', type=str, help='Document content')
    parser.add_argument('--model-path', type=str, help='Path to trained model')
    
    args = parser.parse_args()
    
    # Initialize API
    api = BankingRiskAPI(args.model_path)
    
    try:
        if args.command == 'search':
            if not args.query:
                raise ValueError("--query is required for search command")
            
            filters = json.loads(args.filters)
            result = api.search(args.query, filters)
            
        elif args.command == 'process':
            if not all([args.doc_id, args.title, args.content]):
                raise ValueError("--doc-id, --title, and --content are required for process command")
            
            result = api.process_document(args.doc_id, args.title, args.content)
        
        # Output result as JSON to stdout
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        logging.error(f"Command failed: {e}")
        error_response = {
            'error': str(e),
            'success': False
        }
        print(json.dumps(error_response, indent=2))
        sys.exit(1)

if __name__ == '__main__':
    main()