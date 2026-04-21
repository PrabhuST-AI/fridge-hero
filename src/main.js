import './style.css'

const cookButton = document.querySelector('#cook-button');
const resultContainer = document.querySelector('#result-container');
const loadingElement = document.querySelector('#loading');
const recipeContent = document.querySelector('#recipe-content');

async function getRecipe() {
  const apiKey = document.querySelector('#api-key').value;
  const ing1 = document.querySelector('#ingredient1').value;
  const ing2 = document.querySelector('#ingredient2').value;
  const ing3 = document.querySelector('#ingredient3').value;

  if (!apiKey) {
    alert('Please enter your Groq API Key first!');
    return;
  }

  if (!ing1 && !ing2 && !ing3) {
    alert('Please enter at least one ingredient!');
    return;
  }

  // UI State: Loading
  cookButton.disabled = true;
  cookButton.textContent = 'Mixing ingredients...';
  resultContainer.classList.remove('hidden');
  loadingElement.classList.remove('hidden');
  recipeContent.innerHTML = '';

  const ingredients = [ing1, ing2, ing3].filter(i => i.trim() !== '').join(', ');
  
  const prompt = `You are a professional chef. Create a delicious, creative recipe using these ingredients: ${ingredients}. 
  Format the response with:
  - A catchy Recipe Title (starting with ##)
  - An "Ingredients" section (starting with ###)
  - A "Instructions" section (starting with ###)
  Keep it concise and clear.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch recipe');
    }

    const data = await response.json();
    const recipeText = data.choices[0].message.content;
    
    // Simple markdown-ish formatting for the response
    renderRecipe(recipeText);

  } catch (error) {
    console.error(error);
    recipeContent.innerHTML = `<p style="color: #e53e3e;">Error: ${error.message}</p>`;
  } finally {
    loadingElement.classList.add('hidden');
    cookButton.disabled = false;
    cookButton.textContent = 'Cook Magic';
  }
}

function renderRecipe(text) {
  // Convert basic markdown to HTML
  let html = text
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n/g, '<br>');

  // Wrap lists
  if (html.includes('<li>')) {
    // This is a very naive way to wrap <li> tags, but works for most LLM outputs
    // A better way would be regex matching groups of lines
  }

  recipeContent.innerHTML = html;
}

cookButton.addEventListener('click', getRecipe);
