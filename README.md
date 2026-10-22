Projeto PIEC2 - NexGuard

Instalar as Dependências: Execute npm install na raiz do projeto (necessário Node.js v18+). O comando instalará automaticamente as dependências do projeto contidas no package.json:

-react e react-dom (Interface)
-vite e @vitejs/plugin-react (Build tool e servidor de desenvolvimento)
-tailwindcss e @tailwindcss/vite (Estilização em Tailwind CSS v4)
-lucide-react (Biblioteca de ícones)

Iniciar o Servidor: Execute "npm run dev" no terminal e acesse a aplicação pelo endereço exibido no terminal (geralmente http://localhost:5173).


# Inicalizar o backend

1. crie e ative o ambiente virtual através de: python -m venv venv (ou CTRL+Shift+P e escolha criar ambiente venv).
2. instale os pacotes principais: pip install fastapi uvicorn e pip install "pydantic[email]".
3. para testar a inicialização, digite no terminal: 'uvicorn src.main:app --reload' e acesse 'http://localhost:8000/docs'.

# Próximos passos

1. configurar o banco de dados
2. adicionar as dependências para isolar as regras de negócio
3. verificar integração com a visão computacional