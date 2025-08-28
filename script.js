const pokemonList = document.getElementById("pokemon-list");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const pageInfo = document.getElementById("page-info");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");

let currentPage = 1;
const limit = 12; // 4 colunas × 3 linhas
let totalPages = 1;

// Buscar Pokémon da API
async function fetchPokemon(page = 1) {
  const offset = (page - 1) * limit;
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  const response = await fetch(url);
  const data = await response.json();

  totalPages = Math.ceil(1126 / limit);

  const promises = data.results.map(async (p) => {
    const res = await fetch(p.url);
    const pokemon = await res.json();

    // Buscar descrição em português
    const speciesRes = await fetch(pokemon.species.url);
    const speciesData = await speciesRes.json();
    const descriptionEntry = speciesData.flavor_text_entries.find(
      (entry) => entry.language.name === "pt" || entry.language.name === "en"
    );
    const description = descriptionEntry
      ? descriptionEntry.flavor_text.replace(/\f/g, " ")
      : "Descrição não disponível.";

    return { ...pokemon, description };
  });

  const pokemons = await Promise.all(promises);
  renderPokemons(pokemons);
}

// Renderizar lista de Pokémon
function renderPokemons(pokemons) {
  pokemonList.innerHTML = "";
  pokemons.forEach((pokemon) => {
    const types = pokemon.types
      .map((t) => `<span class="type ${t.type.name}">${t.type.name}</span>`)
      .join(" ");

    // cores dos tipos
    const typeColors = pokemon.types.map(t => {
      switch(t.type.name) {
        case 'bug': return '#A6B91A';
        case 'dark': return '#705746';
        case 'dragon': return '#6F35FC';
        case 'electric': return '#F7D02C';
        case 'fairy': return '#D685AD';
        case 'fighting': return '#C22E28';
        case 'fire': return '#EE8130';
        case 'flying': return '#A98FF3';
        case 'ghost': return '#735797';
        case 'grass': return '#7AC74C';
        case 'ground': return '#E2BF65';
        case 'ice': return '#96D9D6';
        case 'normal': return '#A8A77A';
        case 'poison': return '#A33EA1';
        case 'psychic': return '#F95587';
        case 'rock': return '#B6A136';
        case 'steel': return '#B7B7CE';
        case 'water': return '#6390F0';
        default: return '#777';
      }
    });

    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
      <div class="types">${types}</div>
      <p>ID: #${pokemon.id}</p>
      <p class="description">${pokemon.description}</p>
    `;

    // borda hover com gradiente
    card.addEventListener('mouseenter', () => {
      if (typeColors.length === 1) {
        card.style.borderColor = typeColors[0];
      } else {
        card.style.borderImage = `linear-gradient(45deg, ${typeColors.join(',')}) 1`;
        card.style.borderStyle = 'solid';
        card.style.borderWidth = '3px';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.border = '3px solid transparent';
      card.style.borderImage = '';
    });

    pokemonList.appendChild(card);
  });

  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
}

// Pesquisa de Pokémon por nome
searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.toLowerCase().trim();
  if (!query) return fetchPokemon(currentPage);

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    if (!res.ok) throw new Error("Pokémon não encontrado");
    const pokemon = await res.json();

    const speciesRes = await fetch(pokemon.species.url);
    const speciesData = await speciesRes.json();
    const descriptionEntry = speciesData.flavor_text_entries.find(
      (entry) => entry.language.name === "pt" || entry.language.name === "en"
    );
    const description = descriptionEntry
      ? descriptionEntry.flavor_text.replace(/\f/g, " ")
      : "Descrição não disponível.";

    renderPokemons([{ ...pokemon, description }]);
    pageInfo.textContent = "Resultado da busca";
  } catch (error) {
    pokemonList.innerHTML = `<p>Pokémon não encontrado.</p>`;
  }
});

// Paginação
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchPokemon(currentPage);
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchPokemon(currentPage);
  }
});

// Carregar inicial
fetchPokemon();
