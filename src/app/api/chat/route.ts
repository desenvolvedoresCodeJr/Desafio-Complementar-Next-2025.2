import dialogflow from '@google-cloud/dialogflow';
import { NextResponse, NextRequest } from 'next/server'; 

const projectId = process.env.DIALOGFLOW_PROJECT_ID; //armazena o id do projeto do Google Cloud Dialogflow
const sessionClient = new dialogflow.SessionsClient(); //cria um cliente do Dialogflow



export async function POST(request: NextRequest) { //função de requisição feita pelo cliente. Será executada sempre que houver uma requisição POST para a URL /api/chat
    console.log("Recebida requisição POST para /api/chat");
    if (!projectId) { // verifica se a variável de ambiente está definida corretamente
      console.error("DIALOGFLOW_PROJECT_ID não definido no ambiente.");
      return NextResponse.json( //retorna o erro para o front-end
          { text: 'Erro de configuração no servidor.', error: 'Project ID ausente' },
          { status: 500 }
      );
    }
    
    const { sessionId, message } = await request.json(); //extrai o id da sessão (para manter o contexto) e a mensagem do corpo da requisição

    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId); //cria o caminho (URL) para o chat identificar a sessão - usado para manter o contexto da conversa

    const formatRequest = {  //monta o objeto de requisição da forma que o Dialogflow espera
        session: sessionPath,
        queryInput: { //define a entrada da consulta (texto e idioma)
            text: {
                text: message, //mensagem enviada pelo usuário
                languageCode: 'pt-BR',
            },
        },
    };

    try { //tenta enviar a requisição para o Dialogflow
        const responses = await sessionClient.detectIntent(formatRequest); //envia a requisição já formatada para o Dialogflow e armazena a resposta.
        const result = responses[0]?.queryResult;
        //Acessa o primeiro item do array responses (onde estão localizadas a intent e a resposta para ela)
        //.queryResult é o sub-objeto que contém as informações precisas, ou seja, a intent acionada, os parâmetros extraídos e o texto de resposta.

        if (!result) { //bloco de verificação para garantir que a resposta do Dialogflow não esteja vazia
            console.error('Dialogflow: resposta vazia', { responses });
            return NextResponse.json(
                { text: 'Nenhuma resposta do Dialogflow.', error: 'resposta vazia' },
                { status: 502 }
            );
        }
        console.log("INTENT ACIONADA:", result.intent ? result.intent.displayName : 'NÃO RECONHECIDA');
        console.log("TEXTO RECEBIDO DO DF:", result.fulfillmentText);

        return NextResponse.json({ //retorna a resposta formatada para o front-end
            text: result.fulfillmentText ?? '', //texto de resposta do bot
            intent: result.intent?.displayName ?? null, //intent acionada
            parameters: result.parameters ?? null, //parâmetros extraídos pela intent
        }, { status: 200 }); //status 200 indica sucesso

    } catch (error) { //bloco de captura de erros, caso algo dê errado na comunicação com o Dialogflow
        console.error('ERRO Dialogflow:', error);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        //verifica se o erro é uma instância de Error para extrair a mensagem corretamente
        //basicamente só para informar o erro em forma de string, para facilitar o debug

        return NextResponse.json( //retorna o erro para o front-end
            { text: 'Erro ao comunicar com o chatbot.', error: errorMessage },
            { status: 500 }
        );
    }
}  
