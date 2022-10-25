export class CorridaMaluca {

    constructor(pista, corredores_array){  //pista e array de corredores necessario
        this.pista = pista
        this.corredores_array = corredores_array
    }

    realizar_corrida(){
        let rodada = 0
        let vencedor = false

        let corredores = this.ajusteCorredor()
        
        while(vencedor==false){  //enquanto nao houver vencedor, continua

            rodada++
            corredores = this.avancaCorredores(corredores, rodada)
            vencedor = this.verificaVencedor(corredores)
        }

        return vencedor
    }


    calculaVantagem() {
        this.corredores_array.forEach(corredor => {
            if(this.pista.tipo == corredor.vantagem){  //tipo e vantagem iguais, adiciona

                corredor.velocidade +=2
                corredor.drift +=2
                corredor.aceleracao +=2
            }
        });
    }

    criarCorredor(corredor, aliado, inimigo) {
        const novo_corredor = {

            posicao: 0,
            personagem: corredor,
            aliado: aliado,
            inimigo: inimigo,
            buff_posicao_pista: { valorBuff: 0 , jaPassou:[]}  //conferir os buffs na pista
        }

        return novo_corredor
    }

    ajusteCorredor(){

        const corredores = []
        this.calculaVantagem()

        const random_aliado_inimigo = [...this.corredores_array, null]
       
        this.corredores_array.forEach(personagem => {

            let corredor = null

            //caso nao tenha aliado ou inimigo, algoritmo gera um
            let aliado = random_aliado_inimigo[Math.floor(Math.random() * random_aliado_inimigo.length)]
            let inimigo = random_aliado_inimigo[Math.floor(Math.random() * random_aliado_inimigo.length)]

           //caso aliado e inimigo forem o mesmo, so mantem aliado
            if(aliado == inimigo){
                inimigo = null
            }
            //aliado nao pode ser o proprio corredor
            if(aliado != null && aliado.nome == personagem.nome){
                aliado = null
            }
            if(inimigo != null && inimigo.nome == personagem.nome){
                inimigo = null
            }

            //cria novamente o corredor
            if(aliado != null && inimigo != null){
                corredor = this.criarCorredor(personagem, aliado.nome, inimigo.nome)
            }
            else if(aliado == null && inimigo != null){
                corredor = this.criarCorredor(personagem, aliado, inimigo.nome)
            }
            else if(aliado != null && inimigo == null ){
                corredor = this.criarCorredor(personagem, aliado.nome, inimigo)
            }
            else{
                corredor = this.criarCorredor(personagem, aliado, inimigo)
            }

            corredores.push(corredor)
        });

        return corredores
    }

    debuffPista(avanco_corredor) {
        return avanco_corredor + this.pista.debuff
    }


    buffPosicaoPista(corredor, corredores) {

        const posicoes_buffs_tamanho = this.pista.posicoesBuffs.length
        let buff_posicao_pista = 0
        
        //comeca do ultimo buff de pista, para conferir os corredores em ordem
        for (let i = posicoes_buffs_tamanho-1; i >= 0; i--) {

            if(corredor.posicao >= this.pista.posicoesBuffs[i]){
                
                //se a posicao do corredor for maior, verifica se ja passou, caso nao, nesta rodada recebe buff
                if(corredor.buff_posicao_pista.jaPassou.includes(this.pista.posicoesBuffs[i]) == false){
                    
                    //verificar quantidade de buff
                    corredores.forEach( c => {
                        if(c.personagem != corredor.personagem && c.posicao >= this.pista.posicoesBuffs[i]){
                            buff_posicao_pista++;
                        }
                    });

                    corredor.buff_posicao_pista.jaPassou.push(this.pista.posicoesBuffs[i])
                    break;
                }
                else{
                    break;
                }
            }   
        }

        return buff_posicao_pista
    }
    
    //aliado
    buffAliado(avanco_corredor, corredor, corredores) {
        if(corredor.aliado == null){
            return avanco_corredor
        }

        const posAliado = this.buscaPosicao(corredor.aliado, corredores)
        const distancia = Math.abs(corredor.posicao - posAliado)
        if(distancia >= 0 && distancia <= 2){
            avanco_corredor+=1  //incrementa
        }

        return avanco_corredor
    }

    //inimigo
    buffInimigo(avanco_corredor, corredor, corredores) {
        if(corredor.inimigo == null){
            return avanco_corredor
        }

        const posInimigo = this.buscaPosicao(corredor.inimigo, corredores)
        const distancia = Math.abs(corredor.posicao - posInimigo)
        if(distancia >= 0 && distancia <= 2){
            avanco_corredor-=1  //decrementa
        }

        return avanco_corredor
    }

    //dentre um array fornecido, retorna a posicao do nome procurado
    buscaPosicao(nome, corredores){
        let posicao = 0

        corredores.forEach(corredor => {
            if(corredor.personagem.nome == nome){
                posicao = corredor.posicao
            }
        })

        return posicao
    }

    //aplica os buffs e debuffs respectivos
    aplicaEfeito(corredor, corredores, rodada) {

        //aceleracao, drift ou velocidade
        let avanca = corredor.personagem.velocidade
        if(rodada <= 3){
            avanca = corredor.personagem.aceleracao
        }
        if(rodada % 4 == 0){
            avanca = corredor.personagem.drift
        }
        
        //buffs/debuffs
        avanca = this.debuffPista(avanca)
        avanca = this.buffAliado(avanca, corredor, corredores)
        avanca = this.buffInimigo(avanca, corredor, corredores)

        avanca -= corredor.buff_posicao_pista.valorBuff

        if(avanca <= 0){
            avanca = 0
        }

        return avanca
    }

    avancaCorredores(corredores, rodada) {

        corredores.forEach(corredor => {
            const avanca = this.aplicaEfeito(corredor, corredores, rodada)

            //dick vigarista na penultima posicao faz trapaca (regra)
            if(corredor.personagem.nome == 'Dick Vigarista' && (corredor.posicao + avanca) >= this.pista.tamanho){
                corredor.posicao += 0
            }
            else{
                corredor.posicao += avanca
            }
            
            //verifica se ja passou pelo buff de posicao da pista para proxima rodada
            const buff = this.buffPosicaoPista(corredor, corredores)
            corredor.buff_posicao_pista.valorBuff = buff
        })

        //sort ordena pelas posicoes
        corredores.sort((c1,c2) => {
            if(c1.posicao > c2.posicao){ return -1 }
            else{ return 1 }
        })

        return corredores
    }

    
    verificaVencedor(corredores) {
        const tamPista = this.pista.tamanho
        const vencedor = []

        corredores.forEach(corredor => {
            if(corredor.posicao >= tamPista){  //se eh do tamanho da pista, tem ganhador
                vencedor.push(corredor.personagem.nome)
            }
        })
        
        if(vencedor.length == 0){
            return false
        }else{
            return vencedor
        }
    }
}
