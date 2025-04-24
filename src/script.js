// Seleciona o formulário com o ID "formViagem"
const form = document.getElementById("form-viagem");

// Adiciona um ouvinte de evento que será executado quando o formulário for enviado
form.addEventListener("submit", async (e) => {
  // Impede o comportamento padrão do formulário (recarregar a página)
  e.preventDefault();

  // Pega o valor digitado no campo de origem
  const origem = document.getElementById("origem").value;

  // Pega o valor digitado no campo de destino
  const destino = document.getElementById("destino").value;

  // Converte o valor digitado no campo de autonomia para número decimal
  const autonomia = parseFloat(document.getElementById("autonomia").value);

  // Converte o valor digitado no campo de preço para número decimal
  const preco = parseFloat(document.getElementById("preco").value);

  // Chave da API do OpenRouteService (substitua pela sua se necessário)
  const apiKey = "5b3ce3597851110001cf6248b783921a7b394aefa496769ccf9d6ba2";

  // Função auxiliar para buscar as coordenadas de uma cidade usando geocodificação
  async function getCoordinates(city) {
    // Faz a requisição para a API de geocodificação passando o nome da cidade
    const res = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
        city
      )}`
    );
    // Converte a resposta para JSON
    const data = await res.json();

    // Retorna as coordenadas da primeira correspondência encontrada (longitude, latitude)
    return data.features[0]?.geometry.coordinates;
  }

  // Obtém as coordenadas da cidade de origem
  const start = await getCoordinates(origem);

  // Obtém as coordenadas da cidade de destino
  const end = await getCoordinates(destino);

  // Se alguma cidade não for encontrada, exibe um alerta e cancela o fluxo
  if (!start || !end) {
    alert("Não foi possível localizar uma ou ambas as cidades.");
    return;
  }

  // Faz uma requisição POST para a API de rotas para calcular a distância
  const response = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
    {
      method: "POST",
      headers: {
        Authorization: apiKey, // Autenticação com a chave da API
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [start, end], // Envia as coordenadas no formato esperado
      }),
    }
  );

  // Converte a resposta da API de rotas para JSON
  const data = await response.json();

  // Extrai a distância em metros e converte para quilômetros
  const distancia = data.features[0].properties.summary.distance / 1000;

  // Calcula o custo da viagem com base na autonomia e no preço do combustível
  const custo = ((distancia / autonomia) * preco).toFixed(2);

  // Atualiza o conteúdo da div com ID "resultado" exibindo a distância e o custo
  document.getElementById("resultado").innerText = `🛣️ ${distancia.toFixed(
    2
  )} km - 💸 R$ ${custo}`;
});