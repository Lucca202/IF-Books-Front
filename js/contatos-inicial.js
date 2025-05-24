/*
    @author : Lcnato  bv3044297
    implementacao: 21 / 05/ 2025
    Ajuste: Comando iniciais
        add orientaçca a objetos inicial
*/

var IFbooks = IFbooks || {};  // cria objeto

/**
 * IFBooks.Teste padrão de classe IFBooks.NomeClasse = (function(){
 * }());
 * 
 */
IFbooks.Teste = (function () {
    
    function Teste() {  // construtor
        console.log("Executei Construtor");
    }

    Teste.prototype.iniciar = function(){
        console.log("Executei Iniciar...");
        onTeste("Executei o Teste pelo Iniciar...");
    }

    function onTeste(mensagem) {
        console.log(mensagem);
    }
    
    return Teste;
}());


$(function() {
    var ifbooks = new IFbooks.Teste();
    ifbooks.iniciar();
}
);

// function teste() {
//     alert("Olá caneco");
// }


