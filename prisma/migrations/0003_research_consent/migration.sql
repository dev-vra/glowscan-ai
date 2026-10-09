-- Consentimento opcional para uso de dados anonimizados em pesquisa/estudos (LGPD, finalidade separada).
ALTER TYPE "ConsentKind" ADD VALUE IF NOT EXISTS 'research_data';
