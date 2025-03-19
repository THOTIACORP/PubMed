const axios = require('axios');
const fs = require('fs'); // Módulo para trabalhar com o sistema de arquivos

// Função para buscar publicações no PubMed por país
async function buscarPublicacoesPorPais(pais) {
    const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
    const params = {
        db: 'pubmed',
        term: `"Facial Analysis" AND "${pais}"`,
        retmax: '0',  // Queremos apenas o número total de publicações
        retmode: 'xml'
    };

    try {
        const response = await axios.get(url, { params });
        // Parse a resposta XML para pegar o número de publicações
        const totalPublicacoes = response.data.match(/<Count>(\d+)<\/Count>/);
        if (totalPublicacoes) {
            return totalPublicacoes[1]; // Retorna o número de publicações
        } else {
            return 0; // Se não houver resultados, retorna 0
        }
    } catch (error) {
        console.error(`Erro ao buscar publicações para ${pais}:`, error.message);
        return 0;
    }
}

// Função para obter a lista de todos os países usando a REST Countries API
async function obterListaDePaises() {
    try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const paises = response.data.map(pais => pais.name.common); // Pega o nome do país
        return paises;
    } catch (error) {
        console.error('Erro ao obter a lista de países:', error.message);
        return [];
    }
}

// Função para iterar sobre todos os países e obter o total de publicações
async function buscarPublicacoesPorTodosOsPaises() {
    const paises = await obterListaDePaises(); // Obtém a lista de países
    const resultados = {};

    for (let pais of paises) {
        const total = await buscarPublicacoesPorPais(pais);
        resultados[pais] = total;
        console.log(`${pais}: ${total} publicações`);
    }

    // Salvar os resultados em um arquivo JSON
    try {
        fs.writeFileSync('resultados.json', JSON.stringify(resultados, null, 2));
        console.log('Resultados salvos em resultados.json');
    } catch (error) {
        console.error('Erro ao salvar o arquivo JSON:', error.message);
    }
}

// Chama a função principal
buscarPublicacoesPorTodosOsPaises();
