# 📝 Formulário de Cadastro

Formulário de criação de conta feito com **HTML, CSS e JavaScript**. Ele valida os dados no navegador e envia os cadastros para uma **planilha do Google** usando o **Google Apps Script**.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white)

---

## ✨ Funcionalidades

### Layout
- Formulário em **duas colunas** no computador, feito com CSS Grid.
- Em telas de até **500px** (celular), os campos ficam em **uma coluna só**.
- Ícones nos campos e botões com efeito ao passar o mouse.
- Botão de **mostrar/ocultar senha** (ícone de olho) nos dois campos de senha.

### Campos
| Campo | Tipo |
|---|---|
| Primeiro nome | texto |
| Último nome | texto |
| Data de nascimento | data |
| E-mail | e-mail |
| Senha | senha |
| Confirme a senha | senha |
| Gênero | Feminino / Masculino / Não informar |

### Validação dos dados
A validação acontece quando o usuário clica em **Criar Conta**. Cada campo com problema recebe uma **borda vermelha** e uma **mensagem de erro** logo abaixo. Os campos corretos ficam com **borda verde**.

| Campo | Regras |
|---|---|
| Nome e sobrenome | obrigatórios, mínimo de 3 caracteres, apenas letras (aceita acentos e espaços) |
| Data de nascimento | obrigatória, ano entre 1920 e o ano atual |
| E-mail | obrigatório, formato válido (`nome@dominio.com`) |
| Senha | mínimo de 8 caracteres, com pelo menos 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial (`!@#$%^&*`) |
| Confirmação de senha | precisa ser igual à senha |
| Gênero | uma opção precisa estar marcada |

> O `<form>` usa o atributo `novalidate` para desligar os balões padrão do navegador. Assim, quem valida é o JavaScript, com as mensagens do próprio projeto.

### Envio para o Google Planilhas
- Se tudo estiver válido, os dados são enviados com `fetch` + `FormData`, **sem recarregar a página**.
- O botão fica desativado durante o envio, para evitar cadastros duplicados.
- Aparece um aviso de **sucesso** ou de **erro**, e o formulário é limpo depois de um envio bem-sucedido.
- A **confirmação de senha não é enviada**, só a senha.
- Na planilha, cada cadastro vira uma linha com a **data e hora** do envio.

### Limpeza automática da planilha
- Uma função no Apps Script apaga os cadastros com mais de **N dias** (padrão: 7).
- Um **acionador baseado em tempo** roda essa limpeza todos os dias, sozinho.

---

## 🛠️ Tecnologias

| Tecnologia | Uso no projeto |
|---|---|
| **HTML5** | Estrutura do formulário e campos (`text`, `date`, `email`, `password`, `radio`) |
| **CSS3** | Visual, Flexbox, CSS Grid (duas colunas), media query para celular, estados de erro e sucesso |
| **JavaScript (ES6+)** | Validação com expressões regulares, mostrar/ocultar senha, envio com `fetch`, `async/await` e `FormData` |
| **Google Apps Script** | Recebe os dados (`doPost`), grava na planilha e faz a limpeza automática |
| **Google Planilhas** | Armazena os cadastros |
| **Font Awesome 7** | Ícones |
| **Google Fonts (Poppins)** | Fonte |

---

## 📁 Estrutura

```
formuario_1/
├── index.html              # estrutura do formulário
├── src/
│   ├── javascript/
│   │   └── script.js       # validação, mostrar senha e envio
│   └── styles/
│       └── style.css       # estilos e layout responsivo
├── LICENSE
└── README.md
```

---

## 🚀 Como usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/valprogramacao/formuario_1.git
   ```
2. Abra o arquivo `index.html` no navegador (ou use a extensão **Live Server** do VS Code).

Para os cadastros chegarem a uma planilha **sua**, siga a configuração abaixo.

---

## 📊 Configurar a planilha do Google

1. Crie uma planilha no Google Planilhas e renomeie a aba para **`Cadastros`**.
2. Na linha 1, coloque os cabeçalhos:

   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | Data do cadastro | Primeiro Nome | Último Nome | Nascimento | E-mail | Gênero | Senha |

3. Vá em **Extensões > Apps Script** e cole o código abaixo.
4. Clique em **Implantar > Nova implantação > App da Web**, com:
   - **Executar como:** Eu
   - **Quem pode acessar:** Qualquer pessoa
5. Copie a URL gerada (termina em `/exec`) e cole na constante `scriptURL` do arquivo `src/javascript/script.js`.
6. *(Opcional)* Para a limpeza automática, vá em **Acionadores > Adicionar gatilho**, escolha a função `limparCadastrosAntigos`, a origem **Baseado em tempo** e uma frequência **diária**.

> Sempre que alterar o `doPost`, publique uma nova versão em **Implantar > Gerenciar implantações > editar > Nova versão**. A URL continua a mesma.

<details>
<summary><strong>Código do Apps Script (Código.gs)</strong></summary>

```javascript
// Recebe os dados do formulário e grava uma linha na aba "Cadastros"
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const planilha = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cadastros');
    const dados = e.parameter;

    planilha.appendRow([
      new Date(),
      dados['name'],
      dados['last-name'],
      dados['birthdate'],
      dados['email'],
      dados['gender'],
      dados['password']
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: erro.message }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Apaga cadastros mais antigos que DIAS_PARA_MANTER (rodado por um acionador diário)
const DIAS_PARA_MANTER = 7;

function limparCadastrosAntigos() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const planilha = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cadastros');
    const ultimaLinha = planilha.getLastRow();
    if (ultimaLinha < 2) return;

    const limite = new Date();
    limite.setDate(limite.getDate() - DIAS_PARA_MANTER);

    const datas = planilha.getRange(2, 1, ultimaLinha - 1, 1).getValues();

    for (let i = datas.length - 1; i >= 0; i--) {
      const data = datas[i][0];
      if (data instanceof Date && data < limite) {
        planilha.deleteRow(i + 2);
      }
    }
  } finally {
    lock.releaseLock();
  }
}
```

</details>

---

## ⚠️ Observações

Este é um **projeto de estudo**. Em um sistema real:
- **Senhas não devem ficar em texto puro** numa planilha. O certo é guardar só um *hash* da senha, num banco de dados com backend próprio.
- A URL do Apps Script fica visível no `script.js`. Qualquer pessoa que tenha a URL consegue enviar dados para a planilha.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [`LICENSE`](LICENSE).

Desenvolvido por **Valdirene Bombini**.
