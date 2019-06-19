#! /usr/bin/env node
const path = require('path');
var compressor = require('node-minify');//BASE PARA COMPRESSAO
var fs = require("fs-extra");
var copy = require('recursive-copy');
const tinify = require("tinify");//Compressor de imagem

tinify.key ="InsirasuaAPItinify";//KEY do compressor de imagens


const diretorio_inicial = path.join(process.cwd(), 'src');

var pastabase = path.join(process.cwd() , '');

var pastadestino = diretorio_inicial;

//MINIFICA CSS
//ENTRADA: DIRETORIO COMPLETO DO CSS
//SAIDA: CSS MINIFICADO
//PRE-CONDICAO: ARQUIVO PRECISA SER CSS.CSS
//POS-CONDICAO: NENHUMA
function minificarcss(nomearquivo){
    compressor.minify({
		compressor: 'clean-css',	//Compressor utilizado para reduzir o CSS.
		input: nomearquivo,
		output: nomearquivo,
		options: {
			advanced: true, 
			aggressiveMerging: true 
		}
 });
 
}
//MINIFICA PNG
//ENTRADA: DIRETORIO COMPLETO DA IMAGEM
//SAIDA: IMAGEM COM TAMANHO REDUZIDO
//PRE-CONDICAO: ARQUIVO PRECISA SER IMAGEM
//POS-CONDICAO: NENHUMA
function minificarpng(nomearquivo,dir) {
    const source = tinify.fromFile(nomearquivo);
    source.toFile(nomearquivo);
    
}
//MAPEADOR DE DIRETORIO
//ENTRADA: DIRETORIO INICIAL
//SAIDA: IMAGEM COM TAMANHO REDUZIO E CSS REDUZIDO
//PRE-CONDICAO: NENHUM
//POS-CONDICAO: NENHUMA
function crawl(dir){
    var files = fs.readdirSync(dir);
    for(var x in files){
        var diretorio_com_o_arquivo = path.join(dir, files[x]);
               
        
        if(fs.lstatSync(diretorio_com_o_arquivo).isDirectory()){//VERIFICA SE É DIRETORIO
            crawl(diretorio_com_o_arquivo);//ENTRA NO DIRETORIO
        }else{
            const nome_arquivo_com_extensao = diretorio_com_o_arquivo.split(/[\\/]/).pop();//Remove o caminho do arquivo(/home/index.html para somente index.html)
            if(nome_arquivo_com_extensao == 'css.hbs'){ //Verificado se o arquivo é css.hbs
                   fs.rename(diretorio_com_o_arquivo, dir + '/css.css', function(err) { //Prepara o arquivo para compressao, renomeia para css.css
                        if ( err ) console.log('ERRO: ' + err);
                                });

                                minificarcss( dir + '/css.css');//Inicia o minify do CSS

                     fs.rename(dir + '/css.css', dir + '/css.hbs', function(err) {//Volta o arquivo para css.hbs
                        if ( err ) console.log('ERRO: ' + err);
                                });
             
            }else if(path.extname(nome_arquivo_com_extensao) == '.png'){ //Verifica se o arquivo é imagem(PNG)
                        minificarpng(diretorio_com_o_arquivo, dir); //Inicia o processo de compressao da imagem
                        
            }else if(path.extname(nome_arquivo_com_extensao) == '.css'){ //Verifica se o arquivo é CSS
                minificarcss(dir + '/' + nome_arquivo_com_extensao);//Inicia o minify do CSS
                

        }
    }

}
}


//COPIA PASTA DE DEV PARA BUILD
//ENTRADA: DIRETORIO INICIAL
//SAIDA: TODOS OS ARQUIVOS PARA OUTRA PASTA
//PRE-CONDICAO: NENHUM
//POS-CONDICAO: NENHUMA
async function copiadepastabase(){

    await fs.remove(pastadestino).then(async (response) =>{
        fs.mkdirsSync(diretorio_inicial);
    
         await copy(pastabase, pastadestino).then(function(response){
            //console.log(response)
    
        }).catch(function(error){
            //console.log(error)
        }) 
    }).catch(async (error) => {
        console.log(error)
         fs.mkdirsSync(diretorio_inicial);
    
        await copy(pastabase, pastadestino).then(function(response){
            //console.log(response)
    
        }).catch(function(error){
            //console.log(error)
        })
    })
   

    
}

async function  main (){ 
    await copiadepastabase();
    crawl(diretorio_inicial);
}

console.log('\tCOMPRESSOR DE CSS E IMAGEM');
console.log('\tPROCESSO INICIANDO NO DIRETORIO: ' + diretorio_inicial);
main();