import axios from 'axios'

import { CorridaMaluca } from '../src/index'

let pistas_json
let corredores_json

beforeAll(async () => {
  pistas_json = (await axios.get('https://gustavobuttenbender.github.io/film-array/data/pistas.json')).data
  corredores_json = (await axios.get('https://gustavobuttenbender.github.io/film-array/data/personagens.json')).data
})


describe('suite de obter', () => {

  it('Deve conseguir obter a pista corretamente', () => {
  
    const corrida_maluca = new CorridaMaluca(pistas_json[0])

    const pista_esperada = {
      "id": 1,
      "nome": "Himalaia", 
      "tipo": "MONTANHA",
      "descricao": "Uma montanha nevada, os corredores devem dar uma volta inteira nela, como existe muita neve eles terão dificuldade em enxergar",
      "tamanho": 30,
      "debuff": -2,
      "posicoesBuffs": [6, 17]
    }
    const pista_obtida = corrida_maluca.pista

    expect(pista_obtida).toStrictEqual(pista_esperada)
  })

  it('Deve conseguir obter o corredor corretamente', () => {

    const corredores = []
    corredores.push(corredores_json[0])
    corredores.push(corredores_json[1])
    corredores.push(corredores_json[2])

    const corrida_maluca = new CorridaMaluca(pistas_json[0], corredores)

    const corredor_esperado = {
      "id": 1,
      "nome": "Dick Vigarista",
      "velocidade": 5,
      "drift": 2, 
      "aceleracao": 4,
      "vantagem": "CIRCUITO"
    }

    const corredor_obtido = corrida_maluca.corredores_array[0]

    expect(corredor_obtido).toStrictEqual(corredor_esperado)
  })
})


describe('suite de calcular', () => {

  it('Deve conseguir calcular a vantagem de tipo pista corretamente', () => {

    const corredores = []
    corredores.push(corredores_json[0])
    corredores.push(corredores_json[1])
    corredores.push(corredores_json[2])

    const corrida_maluca = new CorridaMaluca(pistas_json[0], corredores)

    const vantagem_esperada = corrida_maluca.corredores_array[1].velocidade + 2

    corrida_maluca.calculaVantagem()

    const vantagem_obtida = corrida_maluca.corredores_array[1].velocidade

    expect(vantagem_obtida).toBe(vantagem_esperada)
  })

  it('Deve conseguir calcular o debuff de pista corretamente', () => {

    const corredores = []
    corredores.push(corredores_json[0])
    corredores.push(corredores_json[1])
    corredores.push(corredores_json[2])

    const corrida_maluca = new CorridaMaluca(pistas_json[0], corredores)

    const avanco_esperado = 4 - Math.abs(corrida_maluca.pista.debuff)
    const avanco_obtido = corrida_maluca.debuffPista(4) //simulando que o avanco do corredor seria de 4

    expect(avanco_obtido).toBe(avanco_esperado)
  })

  it('Deve conseguir calcular o buff de posição de pista para 3 corredores', () => {

    const aux_corrida = new CorridaMaluca()
    const corredores = []
    corredores.push(aux_corrida.criarCorredor(corredores_json[0]))
    corredores.push(aux_corrida.criarCorredor(corredores_json[1]))
    corredores.push(aux_corrida.criarCorredor(corredores_json[2]))

    const corrida_maluca = new CorridaMaluca(pistas_json[0], corredores)  //pista 0 tem buff em [6, 17]

    corrida_maluca.corredores_array[2].posicao = 8
    corrida_maluca.corredores_array[1].posicao = 7
    corrida_maluca.corredores_array[0].posicao = 6

    const buff_esperado = 2  //terceiro a passar

    const buff_obtido = corrida_maluca.buffPosicaoPista(corrida_maluca.corredores_array[0], corrida_maluca.corredores_array)

    expect(buff_obtido).toBe(buff_esperado)
  })

  it('Deve conseguir calcular a próxima posição corretamente se estiver sob o buff de um aliado', () => {

    const aux_corrida = new CorridaMaluca()
    const corredores = []
    corredores.push(aux_corrida.criarCorredor(corredores_json[0], corredores_json[1]))
    corredores.push(aux_corrida.criarCorredor(corredores_json[1]))

    const corrida_maluca = new CorridaMaluca(pistas_json[0], corredores)
    const avanco_simulado = 4

    const calculo_esperado = avanco_simulado + 1
    const calculo_obtido = corrida_maluca.buffAliado(avanco_simulado, corrida_maluca.corredores_array[0], corredores)

    expect(calculo_obtido).toBe(calculo_esperado)
  })

  it('Deve conseguir calcular a próxima posição corretamente se estiver sob o debuff de um inimigo', () => {

    const aux_corrida = new CorridaMaluca()
    const corredores = []
    corredores.push(aux_corrida.criarCorredor(corredores_json[0], null, corredores_json[1]))
    corredores.push(aux_corrida.criarCorredor(corredores_json[1]))

    const corrida_maluca = new CorridaMaluca(pistas_json[0], corredores)
    const avanco_simulado = 4

    const calculo_esperado = avanco_simulado - 1
    const calculo_obtido = corrida_maluca.buffInimigo(avanco_simulado, corrida_maluca.corredores_array[0], corredores)

    expect(calculo_obtido).toBe(calculo_esperado)
  })

})


describe('suite vencedor', () => {

  it('Deve conseguir completar uma corrida com um vencedor', () => {

    const corredores = []
    corredores.push(corredores_json[0])
    corredores.push(corredores_json[1])
    corredores.push(corredores_json[2])

    const corrida_maluca = new CorridaMaluca(pistas_json[0], corredores)

    const vencedor_esperado = 'Irmãos Rocha'
    const vencedor_obtido = corrida_maluca.realizar_corrida()

    expect(vencedor_obtido[0]).toBe(vencedor_esperado)
  })

})


describe('suite de criar', () => {

  it('Deve conseguir criar corredor corretamente somente com aliado', () => {

    const corrida_maluca = new CorridaMaluca()
    const corredores = []
    corredores.push(corrida_maluca.criarCorredor(corredores_json[0], corredores_json[2]))

    const aliado_esperado = {
      "id": 3,
      "nome": "Irmãos Pavor",
      "velocidade": 4,
      "drift": 2, 
      "aceleracao": 3,
      "vantagem": "DESERTO"
    }
    const aliado_obtido = corredores[0].aliado

    expect(aliado_obtido).toStrictEqual(aliado_esperado)
  })

  it('Deve conseguir criar corredor corretamente somente com inimigo', () => {

    const corrida_maluca = new CorridaMaluca()
    const corredores = []
    corredores.push(corrida_maluca.criarCorredor(corredores_json[0], null, corredores_json[2]))

    const inimigo_esperado = {
      "id": 3,
      "nome": "Irmãos Pavor",
      "velocidade": 4,
      "drift": 2, 
      "aceleracao": 3,
      "vantagem": "DESERTO"
    }
    const inimigo_obtido = corredores[0].inimigo

    expect(inimigo_obtido).toStrictEqual(inimigo_esperado)
  })

  it('Deve conseguir criar corredor corretamente com aliado e inimigo', () => {

    const corrida_maluca = new CorridaMaluca()
    const corredores = []
    corredores.push(corrida_maluca.criarCorredor(corredores_json[0], corredores_json[2], corredores_json[5]))

    const aliado_esperado = {
      "id": 3,
      "nome": "Irmãos Pavor",
      "velocidade": 4,
      "drift": 2, 
      "aceleracao": 3,
      "vantagem": "DESERTO"
    }

    const inimigo_esperado = {
      "id": 6,
      "nome": "Penélope Charmosa",
      "velocidade": 4,
      "drift": 3, 
      "aceleracao": 5,
      "vantagem": "CIDADE"
    }

    const aliado_obtido = corredores[0].aliado
    const inimigo_obtido = corredores[0].inimigo

    expect(aliado_obtido).toStrictEqual(aliado_esperado)
    expect(inimigo_obtido).toStrictEqual(inimigo_esperado)
  })
})


describe('suite de testes gerais', () => {

  it('Deve conseguir calcular as novas posições corretamente de uma rodada para a próxima', () => {

    const aux_corrida = new CorridaMaluca()
    const corredores = []
    corredores.push(aux_corrida.criarCorredor(corredores_json[0]))

    const corrida_maluca = new CorridaMaluca(pistas_json[0], corredores)

    const posicao_esperada = corredores[0].personagem.aceleracao - Math.abs(pistas_json[0].debuff)
    
    const avanca_corredor = corrida_maluca.avancaCorredores(corredores, 1)
    const posicao_obtida = avanca_corredor[0].posicao

    expect(posicao_obtida).toBe(posicao_esperada)
  })

  it('Deve impedir que corredor se mova negativamente mesmo se o calculo de velocidade seja negativo', () => {

    const aux_corrida = new CorridaMaluca()
    const corredores = []
    corredores.push(aux_corrida.criarCorredor(corredores_json[3], null, corredores_json[0]))  //aceleracao 1
    corredores.push(aux_corrida.criarCorredor(corredores_json[0])) 

    const corrida_maluca = new CorridaMaluca(pistas_json[0], corredores)
    
    const posicao_0 = corrida_maluca.avancaCorredores(corredores, 1)

    expect(posicao_0[1].posicao).toBeFalsy()
  })

  it('Deve impedir que o Dick Vigarista vença a corrida se estiver a uma rodada de ganhar', () => {

    const aux_corrida = new CorridaMaluca()
    const corredores = []
    corredores.push(aux_corrida.criarCorredor(corredores_json[0]))
    corredores.push(aux_corrida.criarCorredor(corredores_json[1]))
    corredores.push(aux_corrida.criarCorredor(corredores_json[2]))

    corredores[0].posicao = 29
    const posicao_esperada = corredores[0].posicao

    const corrida_maluca = new CorridaMaluca(pistas_json[0], corredores)
    const novos = corrida_maluca.avancaCorredores(corredores, 10) //após 10 rodadas

    const posicao_obtida = corredores[0].posicao

    expect(posicao_obtida).toBe(posicao_esperada)
  })
})
