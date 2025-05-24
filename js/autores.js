/**
 * Autor: lcnato
 * data implementação? 23 / 05 / 2025
 * Utiliza ajax com jquery para consumir a API Ifbooks
 */


var IFbooks = IFbooks || {};

IFbooks.Autores = (function(){

    function Autores() { // construtor
        this.btnConsultarAutor = $('#btConsultar');
    }

    Autores.prototype.iniciar = function() {
        
        this.btnConsultarAutor.on('click', carregarAutores.bind(this));
    }

    
    function carregarAutores() {
        
        $.ajax({
            url: 'http://localhost:8080/autores',
            method: 'GET',
            dataType: 'json',
            success: exibirTabelaAutores.bind(this),
            error: function() {
                $('#tabela-autores').html('<p class="text-danger">Erro ao carregar os autores.</p>');
            }
        });
    }

    function exibirTabelaAutores(data) {
        // console.log("Entrei na função exibir")
        let html = '<table class="table table-striped table-bordered>';
        html += '<thead class="table-primary">' +
                        '<tr>' +
                        '<th>ID</th>' + 
                        '<th>Nome</th>' + 
                        '<th>Nacionalidade</th>' + 
                        '<th>Data de Nascimento</th>' + 
                        '</tr>' + 
                        '</thead>' + 
                        '<tbody>';

        data.forEach(function(autor){
            html+= `<tr>
                        <td>${autor.id}</td>
                        <td>${autor.nome}</td>
                        <td>${autor.nacionalidade}</td>
                        <td>${autor.dataNascimento}</td>
                    </tr>`;
        });

        html += '</tbody></table>';
        $('#tabela-autores').html(html);
    }

    return Autores;
})();

$(function() {
    var autores = new IFbooks.Autores();
    autores.iniciar();
});