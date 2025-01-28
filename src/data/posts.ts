import { Post } from "../types";

const posts: Post[] = [
  {
    id: 1,
    title: "Introdução ao JavaScript Moderno",
    author: "João Silva",
    date: "2024-01-15",
    category: "Desenvolvimento",
    readingTime: "5 min",
    excerpt:
      "Uma introdução abrangente ao JavaScript moderno e suas funcionalidades mais recentes.",
    content: [
      {
        type: "text",
        content:
          "JavaScript é uma linguagem de programação versátil e essencial para o desenvolvimento web moderno.",
      },
      {
        type: "code",
        language: "javascript",
        content: `// Exemplo de código moderno
const getData = async () => {
  try {
      const response = await fetch('https://api.exemplo.com/data');
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Erro:', error);
  }
};`,
      },
      {
        type: "image",
        url: "https://static.vecteezy.com/system/resources/previews/027/127/463/non_2x/javascript-logo-javascript-icon-transparent-free-png.png",
        alt: "Logo JavaScript",
        caption: "Logo oficial do JavaScript",
      },
      {
        type: "callout",
        style: "info",
        title: "Dica Importante",
        content:
          "Sempre utilize async/await para melhor legibilidade do código assíncrono.",
      },
      {
        type: "list",
        style: "ordered",
        items: [
          "Promises e async/await",
          "Arrow functions",
          "Destructuring",
          "Módulos ES6",
        ],
      },
      {
        type: "blockquote",
        content: "JavaScript é a linguagem da web moderna.",
        author: "Brendan Eich",
        role: "Criador do JavaScript",
      },
    ],
    tags: ["JavaScript", "Programação", "Web Development"],
    relatedPosts: [2, 3],
    series: {
      name: "Fundamentos do JavaScript",
      part: 1,
    },
  },
  {
    id: 2,
    title: "Dicas de CSS Grid",
    author: "Maria Santos",
    date: "2024-01-16",
    category: "Frontend",
    readingTime: "8 min",
    excerpt:
      "Guia completo sobre CSS Grid com exemplos práticos e dicas de uso.",
    content: [
      {
        type: "text",
        content:
          "CSS Grid revolucionou a forma como criamos layouts na web. Veja alguns exemplos práticos:",
      },
      {
        type: "code",
        language: "css",
        content: `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}`,
      },
      {
        type: "video",
        url: "https://exemplo.com/videos/css-grid-tutorial.mp4",
        poster: "https://exemplo.com/thumbnails/css-grid.jpg",
      },
      {
        type: "table",
        headers: ["Propriedade", "Valor", "Descrição"],
        rows: [
          ["display", "grid", "Define o container como grid"],
          ["grid-template-columns", "repeat()", "Define as colunas do grid"],
          ["gap", "20px", "Espaçamento entre os itens"],
        ],
      },
      {
        type: "codepen",
        url: "https://codepen.io/hexagoncircle/pen/KwPpdBZ",
        height: 400,
      },
    ],
    tags: ["CSS", "Web Design", "Layout"],
    relatedPosts: [1, 3],
  },
  {
    id: 3,
    title: "Checklist de Otimização Web",
    author: "Pedro Oliveira",
    date: "2024-01-17",
    category: "Performance",
    readingTime: "6 min",
    excerpt:
      "Lista completa de verificação para otimizar seu site e melhorar a performance.",
    content: [
      {
        type: "text",
        content:
          "A otimização de sites é crucial para uma boa experiência do usuário. Confira nossa checklist completa:",
      },
      {
        type: "checklist",
        title: "Otimização de Performance",
        items: [
          { text: "Minimizar arquivos CSS e JavaScript", checked: true },
          { text: "Otimizar imagens", checked: true },
          { text: "Implementar lazy loading", checked: false },
          { text: "Configurar cache do navegador", checked: true },
        ],
      },
      {
        type: "image",
        url: "https://www.conversion.com.br/wp-content/uploads/2024/03/GRAFICO.png",
        alt: "Gráfico de Performance",
        caption: "Impacto da performance na experiência do usuário",
      },
      {
        type: "table",
        headers: ["Métrica", "Valor Ideal", "Impacto"],
        rows: [
          ["First Contentful Paint", "< 1.8s", "Alto"],
          ["Time to Interactive", "< 3.8s", "Médio"],
          ["Cumulative Layout Shift", "< 0.1", "Alto"],
        ],
      },
    ],
    tags: ["Performance", "Otimização", "Web"],
    relatedPosts: [1, 2],
    series: {
      name: "Otimização Web",
      part: 1,
    },
  },
];

export default posts;
