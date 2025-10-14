# 📋 Guia de Importação em Massa de Veículos

## 🎯 Visão Geral

Este sistema permite importar múltiplos veículos de uma só vez usando uma planilha Excel e um arquivo ZIP com as mídias organizadas. O processo é dividido em 3 etapas simples:

1. **Upload da Planilha Excel** - Dados dos veículos
2. **Upload do ZIP de Mídias** - Fotos, vídeos e laudos
3. **Importação** - Processamento e validação final

---

## 📊 Passo 1: Preparando a Planilha Excel

### 1.1 Baixar o Modelo

1. Acesse o modal de "Importação em Massa"
2. Clique em **"Baixar Modelo Excel"**
3. Salve o arquivo `modelo-importacao-veiculos.xlsx`

### 1.2 Preenchendo os Dados

A planilha contém as seguintes colunas obrigatórias:

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| **ID** | Identificador único do veículo | 1, 2, 3... |
| **Marca** | Marca do veículo | Toyota, Honda, Ford |
| **Modelo** | Modelo do veículo | Corolla, Civic, Focus |
| **Ano** | Ano de fabricação | 2020, 2021, 2022 |
| **Cor** | Cor do veículo | Branco, Preto, Prata |
| **Preço** | Preço de venda | 45000, 38000, 52000 |
| **Quilometragem** | KM rodados | 15000, 25000, 8000 |
| **Combustível** | Tipo de combustível | Flex, Gasolina, Diesel |
| **Câmbio** | Tipo de câmbio | Manual, Automático |
| **Descrição** | Descrição detalhada | Veículo em ótimo estado... |

### 1.3 Regras Importantes

- ✅ **IDs devem ser únicos** e sequenciais (1, 2, 3...)
- ✅ **Não deixe células vazias** nas colunas obrigatórias
- ✅ **Use números para preço e quilometragem** (sem pontos ou vírgulas)
- ✅ **Mantenha a formatação** das colunas

---

## 📁 Passo 2: Organizando as Mídias

### 2.1 Estrutura de Pastas

Crie a seguinte estrutura de pastas para cada veículo:

```
Mídia/
├── 01/
│   ├── Fotos/
│   │   ├── frente.jpg
│   │   ├── traseira.jpg
│   │   ├── lateral.jpg
│   │   └── interior.jpg
│   ├── Videos/
│   │   ├── apresentacao.mp4
│   │   └── test-drive.mp4
│   └── Laudo/
│       └── laudo-tecnico.pdf
├── 02/
│   ├── Fotos/
│   │   └── ...
│   ├── Videos/
│   │   └── ...
│   └── Laudo/
│       └── ...
└── 03/
    └── ...
```

### 2.2 Regras da Estrutura

#### 📂 Pasta Principal
- **Nome:** `Mídia` (exatamente assim, com acento)
- **Localização:** Raiz do ZIP

#### 📂 Pastas dos Veículos
- **Nome:** ID do veículo com 2 dígitos (`01`, `02`, `03`...)
- **Correspondência:** Deve coincidir com o ID da planilha

#### 📂 Subpastas Obrigatórias
- **`Fotos/`** - Pelo menos 1 foto é obrigatória
- **`Videos/`** - Opcional, mas recomendado
- **`Laudo/`** - Opcional, para laudos técnicos

### 2.3 Formatos Aceitos

#### 🖼️ Fotos
- **Formatos:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`
- **Recomendação:** JPG com qualidade alta
- **Tamanho:** Máximo 5MB por foto

#### 🎥 Vídeos
- **Formatos:** `.mp4`, `.avi`, `.mov`, `.wmv`, `.flv`, `.webm`, `.mkv`
- **Recomendação:** MP4 para melhor compatibilidade
- **Tamanho:** Máximo 50MB por vídeo

#### 📄 Laudos
- **Formato:** `.pdf` apenas
- **Tamanho:** Máximo 10MB por arquivo

### 2.4 Criando o ZIP

1. Selecione a pasta `Mídia` completa
2. Clique com botão direito → "Compactar"
3. Nomeie como `midia-veiculos.zip`
4. **Importante:** Não comprima cada pasta separadamente!

---

## 🚀 Passo 3: Processo de Importação

### 3.1 Iniciando a Importação

1. Acesse **"Importação em Massa"** no menu
2. Clique no botão **"Assista o Passo a Passo"** 📺 (piscando) para ver o tutorial
3. Siga as 3 etapas do assistente

### 3.2 Etapa 1: Upload da Planilha

1. Clique em **"Selecionar Planilha Excel"**
2. Escolha seu arquivo `.xlsx`
3. Aguarde a validação automática
4. Verifique se todos os dados estão corretos
5. Clique em **"Prosseguir"**

### 3.3 Etapa 2: Upload das Mídias

1. Clique em **"Selecionar Arquivo ZIP"**
2. Escolha seu arquivo `midia-veiculos.zip`
3. Aguarde a validação da estrutura
4. Verifique o relatório de validação:
   - ✅ **Pastas encontradas**
   - ⚠️ **Avisos** (se houver)
   - ❌ **Erros** (devem ser corrigidos)

### 3.4 Etapa 3: Importação Final

1. Revise o resumo da importação
2. Clique em **"Importar"**
3. Aguarde o processamento
4. Verifique o resultado final

---

## ⚠️ Solução de Problemas

### Erros Comuns na Planilha

| Erro | Causa | Solução |
|------|-------|---------|
| "ID duplicado" | IDs repetidos | Use IDs únicos (1, 2, 3...) |
| "Campo obrigatório vazio" | Célula em branco | Preencha todas as colunas |
| "Formato inválido" | Dados incorretos | Verifique tipos de dados |

### Erros Comuns no ZIP

| Erro | Causa | Solução |
|------|-------|---------|
| "Pasta Mídia não encontrada" | Estrutura incorreta | Crie pasta `Mídia` na raiz |
| "Veículo X sem fotos" | Pasta Fotos vazia | Adicione pelo menos 1 foto |
| "Pasta não corresponde ao ID" | Nome incorreto | Use formato `01`, `02`, `03`... |

### Dicas de Performance

- 📊 **Planilhas:** Máximo 100 veículos por importação
- 📁 **ZIP:** Máximo 500MB total
- 🖼️ **Fotos:** Comprima para reduzir tamanho
- 🎥 **Vídeos:** Use resolução adequada (720p-1080p)

---

## 📞 Suporte

### Antes de Solicitar Ajuda

1. ✅ Verifique se seguiu todos os passos
2. ✅ Confirme a estrutura de pastas
3. ✅ Teste com poucos veículos primeiro
4. ✅ Verifique os formatos de arquivo

### Informações para Suporte

Ao solicitar ajuda, forneça:
- 📋 Arquivo Excel usado
- 📁 Estrutura de pastas (screenshot)
- ❌ Mensagens de erro completas
- 💻 Navegador e versão

---

## 🎯 Checklist Final

### Antes de Importar

- [ ] Planilha Excel preenchida corretamente
- [ ] Estrutura `Mídia/ID/Fotos|Videos|Laudo/` criada
- [ ] Pelo menos 1 foto por veículo
- [ ] Formatos de arquivo corretos
- [ ] ZIP criado com pasta Mídia na raiz
- [ ] IDs da planilha coincidem com pastas

### Durante a Importação

- [ ] Validação da planilha passou
- [ ] Validação do ZIP passou
- [ ] Sem erros críticos no relatório
- [ ] Avisos revisados e aceitos

### Após a Importação

- [ ] Todos os veículos foram importados
- [ ] Fotos estão sendo exibidas
- [ ] Vídeos estão funcionando
- [ ] Dados estão corretos

---

**💡 Dica:** Comece sempre com 2-3 veículos para testar o processo antes de importar grandes quantidades!

---

*Última atualização: Janeiro 2024*