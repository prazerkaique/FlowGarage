# Padrões de Nomenclatura para Associação de Fotos e Veículos

## Visão Geral

Este documento descreve os padrões estabelecidos para associar fotos de veículos através de arquivos XML e ZIP, garantindo que o sistema possa identificar corretamente qual foto pertence a qual veículo.

## Estrutura do XML

### Formato Básico

O XML deve seguir a seguinte estrutura para cada veículo:

```xml
<veiculo>
  <id>001</id>
  <marca>Toyota</marca>
  <modelo>Corolla</modelo>
  <ano>2020</ano>
  <preco>85000</preco>
  <categoria>Sedan</categoria>
  <cor>Branco</cor>
  <quilometragem>45000</quilometragem>
  <transmissao>Automática</transmissao>
  <combustivel>Flex</combustivel>
  <disponivel>true</disponivel>
  <destaque>false</destaque>
  <fotos>
    <foto>toyota_corolla_001_frontal.jpg</foto>
    <foto>toyota_corolla_001_lateral.jpg</foto>
    <foto>toyota_corolla_001_traseira.jpg</foto>
    <foto>toyota_corolla_001_interior.jpg</foto>
  </fotos>
</veiculo>
```

### Padrão de Nomenclatura das Fotos

#### Formato Recomendado
```
{marca}_{modelo}_{id}_{tipo}.{extensao}
```

**Componentes:**
- `{marca}`: Nome da marca em minúsculas, sem espaços ou acentos
- `{modelo}`: Nome do modelo em minúsculas, sem espaços ou acentos  
- `{id}`: Identificador único do veículo (mesmo valor do campo `<id>` no XML)
- `{tipo}`: Tipo da foto (frontal, lateral, traseira, interior, motor, etc.)
- `{extensao}`: Extensão do arquivo (jpg, jpeg, png, webp)

#### Exemplos Práticos

**Veículo: Toyota Corolla (ID: 001)**
- `toyota_corolla_001_frontal.jpg`
- `toyota_corolla_001_lateral_direita.jpg`
- `toyota_corolla_001_lateral_esquerda.jpg`
- `toyota_corolla_001_traseira.jpg`
- `toyota_corolla_001_interior.jpg`
- `toyota_corolla_001_painel.jpg`
- `toyota_corolla_001_motor.jpg`

**Veículo: Honda Civic (ID: 002)**
- `honda_civic_002_frontal.jpg`
- `honda_civic_002_lateral.jpg`
- `honda_civic_002_traseira.jpg`
- `honda_civic_002_interior.jpg`

**Veículo: Volkswagen Gol (ID: 003)**
- `volkswagen_gol_003_frontal.jpg`
- `volkswagen_gol_003_lateral.jpg`
- `volkswagen_gol_003_traseira.jpg`

## Tipos de Foto Sugeridos

### Obrigatórias
- `frontal`: Vista frontal do veículo
- `lateral`: Vista lateral (direita ou esquerda)
- `traseira`: Vista traseira do veículo

### Opcionais
- `lateral_direita`: Vista lateral direita específica
- `lateral_esquerda`: Vista lateral esquerda específica
- `interior`: Interior do veículo
- `painel`: Painel de instrumentos
- `motor`: Compartimento do motor
- `porta_malas`: Porta-malas/bagageiro
- `rodas`: Detalhes das rodas
- `detalhes`: Detalhes específicos (arranhões, acessórios, etc.)

## Estrutura do Arquivo ZIP

### Organização Recomendada

```
veiculos.zip
├── toyota_corolla_001_frontal.jpg
├── toyota_corolla_001_lateral.jpg
├── toyota_corolla_001_traseira.jpg
├── toyota_corolla_001_interior.jpg
├── honda_civic_002_frontal.jpg
├── honda_civic_002_lateral.jpg
├── honda_civic_002_traseira.jpg
├── honda_civic_002_interior.jpg
└── volkswagen_gol_003_frontal.jpg
```

### Organização Alternativa (por Pastas)

```
veiculos.zip
├── 001_toyota_corolla/
│   ├── frontal.jpg
│   ├── lateral.jpg
│   ├── traseira.jpg
│   └── interior.jpg
├── 002_honda_civic/
│   ├── frontal.jpg
│   ├── lateral.jpg
│   ├── traseira.jpg
│   └── interior.jpg
└── 003_volkswagen_gol/
    ├── frontal.jpg
    ├── lateral.jpg
    └── traseira.jpg
```

**Nota:** Para a organização por pastas, o XML deve referenciar o caminho completo:
```xml
<foto>001_toyota_corolla/frontal.jpg</foto>
```

## Validações Implementadas

### Verificações Automáticas

1. **Correspondência de Arquivos**: Verifica se todos os arquivos mencionados no XML existem no ZIP
2. **Arquivos Órfãos**: Identifica arquivos no ZIP que não são referenciados no XML
3. **Extensões Válidas**: Aceita apenas formatos de imagem (jpg, jpeg, png, webp, gif, bmp)
4. **Estrutura XML**: Valida se o XML possui a estrutura correta

### Mensagens de Feedback

- ✅ **Sucesso**: "Correspondência de Fotos Validada - X arquivo(s) encontrado(s)"
- ⚠️ **Aviso**: Lista arquivos não encontrados e arquivos não utilizados
- ❌ **Erro**: Problemas na estrutura do XML ou ZIP corrompido

## Boas Práticas

### Para Nomenclatura
1. **Use sempre minúsculas** para consistência
2. **Substitua espaços por underscores** (`_`)
3. **Remova acentos e caracteres especiais**
4. **Mantenha nomes descritivos mas concisos**
5. **Use IDs únicos e sequenciais**

### Para Organização
1. **Mantenha uma estrutura consistente** em todos os uploads
2. **Use qualidade adequada** para as imagens (não muito pesadas)
3. **Inclua pelo menos 3 fotos** por veículo (frontal, lateral, traseira)
4. **Teste sempre** antes do upload final

### Para XML
1. **Valide a estrutura XML** antes do upload
2. **Use encoding UTF-8** para caracteres especiais
3. **Mantenha campos obrigatórios** sempre preenchidos
4. **Referencie apenas arquivos existentes** no ZIP

## Exemplos de Conversão

### Nomes Problemáticos → Nomes Corretos

| Problemático | Correto |
|-------------|---------|
| `Toyota Corolla 2020 - Frente.JPG` | `toyota_corolla_001_frontal.jpg` |
| `Honda Civic Lateral Dir.png` | `honda_civic_002_lateral_direita.png` |
| `VW Gol - Interior (1).jpeg` | `volkswagen_gol_003_interior.jpeg` |
| `Foto1.jpg` | `toyota_corolla_001_frontal.jpg` |
| `IMG_20240115_143022.jpg` | `honda_civic_002_lateral.jpg` |

## Resolução de Problemas Comuns

### Arquivo não encontrado
- Verifique se o nome no XML corresponde exatamente ao arquivo no ZIP
- Confirme se a extensão está correta (jpg vs jpeg)
- Verifique se não há espaços extras ou caracteres especiais

### Muitos arquivos não utilizados
- Remova arquivos desnecessários do ZIP
- Adicione referências no XML para arquivos importantes
- Organize melhor a estrutura de pastas

### XML inválido
- Verifique se todas as tags estão fechadas corretamente
- Confirme se a codificação é UTF-8
- Valide a estrutura usando um validador XML online

## Ferramentas Recomendadas

### Para Renomear Arquivos em Lote
- **Windows**: PowerToys PowerRename
- **macOS**: Name Mangler, Automator
- **Linux**: rename command, Thunar Bulk Rename

### Para Validar XML
- XMLValidator.com
- XML Notepad (Windows)
- Oxygen XML Editor

### Para Criar ZIP
- 7-Zip (Windows/Linux)
- Archive Utility (macOS)
- WinRAR (Windows)

---

*Este documento deve ser atualizado conforme novas necessidades e melhorias sejam identificadas no sistema.*