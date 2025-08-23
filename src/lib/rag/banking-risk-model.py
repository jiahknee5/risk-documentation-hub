"""
Banking Risk-Specific Language Model Implementation
A lightweight, locally-hosted model for risk document analysis
"""

import torch
import torch.nn as nn
import numpy as np
from typing import List, Dict, Tuple, Optional
import sqlite3
import faiss
import pickle
import re
from dataclasses import dataclass
from enum import Enum
from transformers import AutoTokenizer, AutoModel

# Banking Risk Enums
class RiskLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ComplianceFramework(Enum):
    BASEL_III = "BASEL_III"
    DODD_FRANK = "DODD_FRANK"
    SOX = "SOX"
    GDPR = "GDPR"
    AML_KYC = "AML_KYC"
    MIFID_II = "MIFID_II"

@dataclass
class RiskDocument:
    id: str
    title: str
    content: str
    risk_level: RiskLevel
    compliance_tags: List[ComplianceFramework]
    risk_scores: Dict[str, float]
    embedding: Optional[np.ndarray] = None

class BankingRiskVocabulary:
    """Specialized vocabulary for banking risk domain"""
    
    def __init__(self):
        self.risk_terms = {
            # Credit Risk
            "credit_risk": ["default", "pd", "lgd", "ead", "creditworthiness", "counterparty"],
            "market_risk": ["var", "volatility", "exposure", "trading", "portfolio"],
            "operational_risk": ["fraud", "system failure", "human error", "process breakdown"],
            "liquidity_risk": ["cash flow", "funding", "lcr", "nsfr", "liquidity coverage"],
            
            # Regulatory Terms
            "basel": ["tier 1", "tier 2", "capital adequacy", "rwa", "leverage ratio"],
            "compliance": ["audit", "control", "governance", "regulatory", "framework"],
            
            # Risk Indicators
            "severity": ["critical", "high", "medium", "low", "negligible", "material"],
            "probability": ["likely", "unlikely", "certain", "possible", "remote"],
            
            # Actions
            "mitigation": ["mitigate", "control", "reduce", "transfer", "accept", "avoid"]
        }
        
        self.regex_patterns = self._compile_patterns()
    
    def _compile_patterns(self):
        patterns = {}
        for category, terms in self.risk_terms.items():
            pattern = r'\b(' + '|'.join(terms) + r')\b'
            patterns[category] = re.compile(pattern, re.IGNORECASE)
        return patterns
    
    def extract_risk_features(self, text: str) -> Dict[str, List[str]]:
        """Extract banking risk features from text"""
        features = {}
        for category, pattern in self.regex_patterns.items():
            matches = pattern.findall(text)
            if matches:
                features[category] = list(set(matches))
        return features

class BankingRiskEncoder(nn.Module):
    """Lightweight encoder for banking risk documents"""
    
    def __init__(self, vocab_size=10000, hidden_dim=256, num_layers=6):
        super().__init__()
        
        # Smaller transformer for efficiency
        self.embedding = nn.Embedding(vocab_size, hidden_dim)
        self.position_embedding = nn.Embedding(512, hidden_dim)
        
        # Transformer layers
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim,
            nhead=8,
            dim_feedforward=1024,
            dropout=0.1,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # Task-specific heads
        self.risk_classifier = nn.Sequential(
            nn.Linear(hidden_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, 4)  # 4 risk levels
        )
        
        self.compliance_detector = nn.Sequential(
            nn.Linear(hidden_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, len(ComplianceFramework))
        )
        
        self.embedding_projector = nn.Linear(hidden_dim, 384)
    
    def forward(self, input_ids, attention_mask=None, task="embed"):
        seq_len = input_ids.size(1)
        pos_ids = torch.arange(seq_len, device=input_ids.device).unsqueeze(0)
        
        # Embeddings
        token_emb = self.embedding(input_ids)
        pos_emb = self.position_embedding(pos_ids)
        embeddings = token_emb + pos_emb
        
        # Transformer encoding
        if attention_mask is not None:
            attention_mask = attention_mask.float().masked_fill(
                attention_mask == 0, float('-inf')
            ).masked_fill(attention_mask == 1, float(0.0))
        
        encoded = self.transformer(embeddings, src_key_padding_mask=attention_mask)
        
        # Pool the outputs (mean pooling)
        if attention_mask is not None:
            mask_expanded = attention_mask.unsqueeze(-1).expand(encoded.size()).float()
            sum_embeddings = torch.sum(encoded * mask_expanded, 1)
            sum_mask = torch.clamp(mask_expanded.sum(1), min=1e-9)
            pooled = sum_embeddings / sum_mask
        else:
            pooled = encoded.mean(dim=1)
        
        # Task-specific outputs
        if task == "risk_level":
            return self.risk_classifier(pooled)
        elif task == "compliance":
            return self.compliance_detector(pooled)
        elif task == "embed":
            return self.embedding_projector(pooled)
        else:
            return pooled

class BankingRiskRAG:
    """Complete RAG system for banking risk documents"""
    
    def __init__(self, model_path: Optional[str] = None):
        # Initialize vocabulary
        self.vocab = BankingRiskVocabulary()
        
        # Initialize model
        if model_path:
            self.model = torch.load(model_path)
        else:
            self.model = BankingRiskEncoder()
        self.model.eval()
        
        # Initialize vector store
        self.dimension = 384
        self.index = faiss.IndexFlatL2(self.dimension)
        self.document_store = {}
        
        # Initialize SQLite for metadata
        self.conn = sqlite3.connect('banking_risk_docs.db')
        self._init_database()
        
        # BM25 components
        self.corpus = []
        self.bm25 = None
    
    def _init_database(self):
        """Initialize SQLite schema"""
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                compliance_tags TEXT,
                risk_scores TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                embedding_id INTEGER
            )
        ''')
        
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS risk_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id TEXT,
                alert_type TEXT,
                severity TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            )
        ''')
        
        self.conn.commit()
    
    def process_document(self, doc_id: str, title: str, content: str) -> RiskDocument:
        """Process a document and extract risk information"""
        
        # Extract risk features using vocabulary
        risk_features = self.vocab.extract_risk_features(content)
        
        # Tokenize for model (simplified - in production use proper tokenizer)
        tokens = self._simple_tokenize(content)
        input_ids = torch.tensor([self._tokens_to_ids(tokens[:512])])
        
        with torch.no_grad():
            # Get risk level
            risk_logits = self.model(input_ids, task="risk_level")
            risk_level = RiskLevel(list(RiskLevel)[risk_logits.argmax().item()].value)
            
            # Get compliance tags
            compliance_logits = self.model(input_ids, task="compliance")
            compliance_probs = torch.sigmoid(compliance_logits)
            compliance_tags = [
                ComplianceFramework(list(ComplianceFramework)[i].value)
                for i, prob in enumerate(compliance_probs[0])
                if prob > 0.5
            ]
            
            # Get embedding
            embedding = self.model(input_ids, task="embed").numpy()[0]
        
        # Calculate risk scores
        risk_scores = self._calculate_risk_scores(content, risk_features)
        
        # Create document object
        doc = RiskDocument(
            id=doc_id,
            title=title,
            content=content,
            risk_level=risk_level,
            compliance_tags=compliance_tags,
            risk_scores=risk_scores,
            embedding=embedding
        )
        
        # Store in systems
        self._store_document(doc)
        
        # Check for alerts
        self._check_risk_alerts(doc)
        
        return doc
    
    def _calculate_risk_scores(self, content: str, features: Dict) -> Dict[str, float]:
        """Calculate detailed risk scores"""
        scores = {
            "credit_risk": 0.0,
            "market_risk": 0.0,
            "operational_risk": 0.0,
            "liquidity_risk": 0.0,
            "compliance_risk": 0.0
        }
        
        # Simple scoring based on feature presence and patterns
        content_lower = content.lower()
        
        # Credit risk indicators
        credit_indicators = ["default", "pd", "lgd", "credit exposure", "counterparty"]
        scores["credit_risk"] = sum(1 for ind in credit_indicators if ind in content_lower) / len(credit_indicators)
        
        # Market risk indicators
        market_indicators = ["var", "volatility", "trading loss", "market exposure"]
        scores["market_risk"] = sum(1 for ind in market_indicators if ind in content_lower) / len(market_indicators)
        
        # Add severity multipliers
        if "critical" in content_lower or "severe" in content_lower:
            scores = {k: min(v * 1.5, 1.0) for k, v in scores.items()}
        
        return scores
    
    def _store_document(self, doc: RiskDocument):
        """Store document in database and vector index"""
        # Add to vector index
        embedding_id = len(self.document_store)
        self.index.add(np.array([doc.embedding]))
        self.document_store[embedding_id] = doc
        
        # Store in SQLite
        self.conn.execute('''
            INSERT OR REPLACE INTO documents 
            (id, title, content, risk_level, compliance_tags, risk_scores, embedding_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            doc.id,
            doc.title,
            doc.content,
            doc.risk_level.value,
            ','.join([ct.value for ct in doc.compliance_tags]),
            pickle.dumps(doc.risk_scores),
            embedding_id
        ))
        self.conn.commit()
        
        # Update BM25 corpus
        self.corpus.append({
            'id': doc.id,
            'tokens': self._simple_tokenize(doc.content)
        })
        self._update_bm25()
    
    def _check_risk_alerts(self, doc: RiskDocument):
        """Check for risk conditions that require alerts"""
        alerts = []
        
        # High risk level alert
        if doc.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
            alerts.append({
                'type': 'RISK_LEVEL',
                'severity': doc.risk_level.value,
                'description': f'Document contains {doc.risk_level.value} risk indicators'
            })
        
        # Compliance alerts
        critical_compliance = [ComplianceFramework.BASEL_III, ComplianceFramework.SOX]
        for framework in doc.compliance_tags:
            if framework in critical_compliance:
                alerts.append({
                    'type': 'COMPLIANCE',
                    'severity': 'HIGH',
                    'description': f'Document relates to {framework.value} compliance'
                })
        
        # Risk concentration alerts
        high_risk_count = sum(1 for score in doc.risk_scores.values() if score > 0.7)
        if high_risk_count >= 2:
            alerts.append({
                'type': 'RISK_CONCENTRATION',
                'severity': 'HIGH',
                'description': f'Multiple high risk scores detected ({high_risk_count} categories)'
            })
        
        # Store alerts
        for alert in alerts:
            self.conn.execute('''
                INSERT INTO risk_alerts (document_id, alert_type, severity, description)
                VALUES (?, ?, ?, ?)
            ''', (doc.id, alert['type'], alert['severity'], alert['description']))
        self.conn.commit()
    
    def search(self, query: str, filters: Optional[Dict] = None, top_k: int = 10) -> List[Dict]:
        """Hybrid search with risk-aware ranking"""
        
        # Extract risk context from query
        risk_context = self._analyze_query_risk_context(query)
        
        # Semantic search
        query_embedding = self._get_query_embedding(query)
        semantic_results = self._semantic_search(query_embedding, top_k * 2)
        
        # Keyword search
        keyword_results = self._keyword_search(query, top_k * 2)
        
        # Combine results with risk-aware fusion
        final_results = self._risk_aware_fusion(
            semantic_results, 
            keyword_results, 
            risk_context,
            filters
        )
        
        return final_results[:top_k]
    
    def _analyze_query_risk_context(self, query: str) -> Dict:
        """Extract risk context from search query"""
        context = {
            'risk_focus': [],
            'compliance_focus': [],
            'urgency': 'normal'
        }
        
        query_lower = query.lower()
        
        # Check for risk types
        risk_keywords = {
            'credit': ['credit', 'default', 'counterparty'],
            'market': ['market', 'trading', 'volatility'],
            'operational': ['operational', 'fraud', 'process'],
            'liquidity': ['liquidity', 'funding', 'cash']
        }
        
        for risk_type, keywords in risk_keywords.items():
            if any(kw in query_lower for kw in keywords):
                context['risk_focus'].append(risk_type)
        
        # Check urgency
        if any(word in query_lower for word in ['urgent', 'critical', 'immediate', 'asap']):
            context['urgency'] = 'high'
        
        return context
    
    def _risk_aware_fusion(self, semantic_results, keyword_results, risk_context, filters):
        """Combine search results with risk-aware ranking"""
        scores = {}
        
        # Base scoring
        for i, (doc_id, score) in enumerate(semantic_results):
            scores[doc_id] = {
                'base_score': 0.6 * (1 / (i + 1)),
                'risk_boost': 0,
                'doc': self.document_store.get(doc_id)
            }
        
        for i, (doc_id, score) in enumerate(keyword_results):
            if doc_id in scores:
                scores[doc_id]['base_score'] += 0.4 * (1 / (i + 1))
            else:
                scores[doc_id] = {
                    'base_score': 0.4 * (1 / (i + 1)),
                    'risk_boost': 0,
                    'doc': self._get_document(doc_id)
                }
        
        # Apply risk context boosting
        for doc_id, score_data in scores.items():
            doc = score_data['doc']
            if not doc:
                continue
            
            # Boost based on risk focus match
            for risk_type in risk_context['risk_focus']:
                if doc.risk_scores.get(f"{risk_type}_risk", 0) > 0.5:
                    score_data['risk_boost'] += 0.2
            
            # Boost for high urgency and high risk
            if risk_context['urgency'] == 'high' and doc.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
                score_data['risk_boost'] += 0.3
            
            # Apply filters
            if filters:
                if filters.get('risk_level') and doc.risk_level.value != filters['risk_level']:
                    score_data['base_score'] *= 0.1
                if filters.get('compliance') and not any(
                    ct.value == filters['compliance'] for ct in doc.compliance_tags
                ):
                    score_data['base_score'] *= 0.1
        
        # Calculate final scores and sort
        final_results = []
        for doc_id, score_data in scores.items():
            if score_data['doc']:
                final_score = score_data['base_score'] + score_data['risk_boost']
                final_results.append({
                    'document': score_data['doc'],
                    'score': final_score,
                    'risk_relevance': score_data['risk_boost'] > 0
                })
        
        return sorted(final_results, key=lambda x: x['score'], reverse=True)
    
    def generate_risk_summary(self, documents: List[RiskDocument]) -> str:
        """Generate a risk-aware summary of search results"""
        if not documents:
            return "No relevant risk documents found."
        
        # Analyze overall risk profile
        risk_levels = [doc.risk_level for doc in documents]
        high_risk_count = sum(1 for rl in risk_levels if rl in [RiskLevel.HIGH, RiskLevel.CRITICAL])
        
        # Count compliance frameworks
        all_compliance = []
        for doc in documents:
            all_compliance.extend(doc.compliance_tags)
        compliance_summary = {}
        for cf in all_compliance:
            compliance_summary[cf.value] = compliance_summary.get(cf.value, 0) + 1
        
        # Generate summary
        summary = f"Risk Analysis Summary ({len(documents)} documents):\n\n"
        
        if high_risk_count > 0:
            summary += f"⚠️  HIGH RISK ALERT: {high_risk_count} documents contain high/critical risks\n\n"
        
        summary += "Risk Distribution:\n"
        for level in RiskLevel:
            count = sum(1 for rl in risk_levels if rl == level)
            if count > 0:
                summary += f"  • {level.value}: {count} documents\n"
        
        if compliance_summary:
            summary += "\nCompliance Coverage:\n"
            for framework, count in sorted(compliance_summary.items(), key=lambda x: x[1], reverse=True):
                summary += f"  • {framework}: {count} documents\n"
        
        summary += "\nTop Risk Documents:\n"
        for i, doc in enumerate(documents[:3]):
            summary += f"{i+1}. {doc.title} (Risk: {doc.risk_level.value})\n"
            
            # Add key risk indicators
            high_risks = [k for k, v in doc.risk_scores.items() if v > 0.6]
            if high_risks:
                summary += f"   Key Risks: {', '.join(high_risks)}\n"
        
        return summary
    
    # Utility methods
    def _simple_tokenize(self, text: str) -> List[str]:
        """Simple tokenization for demo - use proper tokenizer in production"""
        return re.findall(r'\b\w+\b', text.lower())
    
    def _tokens_to_ids(self, tokens: List[str]) -> List[int]:
        """Convert tokens to IDs - simplified for demo"""
        # In production, use proper vocabulary mapping
        return [hash(token) % 10000 for token in tokens]
    
    def _get_query_embedding(self, query: str) -> np.ndarray:
        """Get embedding for search query"""
        tokens = self._simple_tokenize(query)
        input_ids = torch.tensor([self._tokens_to_ids(tokens[:512])])
        
        with torch.no_grad():
            embedding = self.model(input_ids, task="embed").numpy()[0]
        
        return embedding
    
    def _semantic_search(self, query_embedding: np.ndarray, k: int) -> List[Tuple[str, float]]:
        """Perform semantic search"""
        distances, indices = self.index.search(np.array([query_embedding]), k)
        
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx < len(self.document_store):
                doc = self.document_store[idx]
                results.append((doc.id, float(dist)))
        
        return results
    
    def _keyword_search(self, query: str, k: int) -> List[Tuple[str, float]]:
        """Perform BM25 keyword search"""
        if not self.bm25:
            return []
        
        from rank_bm25 import BM25Okapi
        
        query_tokens = self._simple_tokenize(query)
        scores = self.bm25.get_scores(query_tokens)
        
        # Get top k results
        top_indices = np.argsort(scores)[::-1][:k]
        results = [(self.corpus[i]['id'], scores[i]) for i in top_indices if scores[i] > 0]
        
        return results
    
    def _update_bm25(self):
        """Update BM25 index"""
        from rank_bm25 import BM25Okapi
        
        if self.corpus:
            tokenized_corpus = [doc['tokens'] for doc in self.corpus]
            self.bm25 = BM25Okapi(tokenized_corpus)
    
    def _get_document(self, doc_id: str) -> Optional[RiskDocument]:
        """Retrieve document by ID"""
        cursor = self.conn.execute(
            "SELECT * FROM documents WHERE id = ?", (doc_id,)
        )
        row = cursor.fetchone()
        
        if row:
            return RiskDocument(
                id=row[0],
                title=row[1],
                content=row[2],
                risk_level=RiskLevel(row[3]),
                compliance_tags=[ComplianceFramework(ct) for ct in row[4].split(',') if ct],
                risk_scores=pickle.loads(row[5]) if row[5] else {}
            )
        
        return None


# Example usage and testing
if __name__ == "__main__":
    # Initialize the system
    rag = BankingRiskRAG()
    
    # Process some sample documents
    sample_docs = [
        {
            "id": "doc001",
            "title": "Credit Risk Policy Q4 2024",
            "content": """This document outlines critical updates to our credit risk management framework. 
            Due to increased default rates in the commercial lending portfolio, we are implementing 
            stricter counterparty risk assessment procedures. The new Basel III requirements mandate 
            a minimum Tier 1 capital ratio of 6%, which requires immediate attention."""
        },
        {
            "id": "doc002",
            "title": "Operational Risk Incident Report",
            "content": """A significant operational risk event occurred due to system failure in the 
            trading platform. This resulted in potential market risk exposure of $2.5M. 
            Immediate mitigation steps have been taken to prevent similar incidents. 
            SOX compliance requires full documentation of control failures."""
        },
        {
            "id": "doc003",
            "title": "Liquidity Coverage Ratio Analysis",
            "content": """Monthly LCR analysis shows adequate liquidity buffers with a ratio of 125%. 
            However, stress testing indicates potential liquidity risk under severe market conditions. 
            NSFR compliance is maintained at 110%. Recommend maintaining higher cash reserves."""
        }
    ]
    
    # Process documents
    for doc in sample_docs:
        result = rag.process_document(doc["id"], doc["title"], doc["content"])
        print(f"\nProcessed: {result.title}")
        print(f"Risk Level: {result.risk_level.value}")
        print(f"Compliance: {[ct.value for ct in result.compliance_tags]}")
        print(f"Risk Scores: {result.risk_scores}")
    
    # Test search
    print("\n\n--- SEARCH TESTS ---")
    
    queries = [
        "Basel III capital requirements",
        "operational risk incidents",
        "critical risk exposure",
        "liquidity coverage compliance"
    ]
    
    for query in queries:
        print(f"\nQuery: '{query}'")
        results = rag.search(query, top_k=3)
        
        for i, result in enumerate(results):
            doc = result['document']
            print(f"{i+1}. {doc.title} (Score: {result['score']:.3f}, Risk: {doc.risk_level.value})")
    
    # Generate risk summary
    all_docs = [result['document'] for result in rag.search("risk", top_k=10)]
    summary = rag.generate_risk_summary(all_docs)
    print(f"\n\n--- RISK SUMMARY ---\n{summary}")