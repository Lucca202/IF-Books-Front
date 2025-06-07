/**
 * Livro: lcnato
 * data implementação? 23 / 05 / 2025
 * Utiliza ajax com jquery para consumir a API Ifbooks
 */


var IFbooks = IFbooks || {};

IFbooks.Livros = (function(){

    function Livros() { // construtor
        this.btnConsultarLivro = $('#btConsultar');
    }

    Livros.prototype.iniciar = function() {
        
        this.btnConsultarLivro.on('click', carregarLivros.bind(this));
    }

    
    function carregarLivros() {
        
        $.ajax({
            url: 'http://localhost:8080/livros',
            method: 'GET',
            dataType: 'json',
            success: exibirTabelaLivros.bind(this),
            error: function() {
                $('#tabela-livros').html('<p class="text-danger">Erro ao carregar os livros.</p>');
            }
        });
    }

    function exibirTabelaLivros(data) {
        // console.log("Entrei na função exibir")
        let html = '<table class="table table-striped table-bordered>';
        html += '<thead class="table-primary">' +
                            '<tr>' +
                                '<th>ID</th>' + 
                                '<th>Nome</th>' + 
                                '<th>Data de Publicação</th>' + 
                                '<th>Editora</th>' + 
                                '<th>Resumo</th>' + 
                                '<th>Autor</th>' + 
                                '<th>Edição</th>' + 
                            '</tr>' + 
                '</thead>' + 
                '<tbody>';

        data.forEach(function(livro){
            html+= `<tr>
                        <td>${livro.id}</td>
                        <td>${livro.nome}</td>
                        <td>${livro.dataPublicacao}</td>
                        <td>${livro.editora}</td>
                        <td>${livro.resumo}</td>
                        <td>${livro.autor.nome}</td>
                    </tr>`;
        });

        html += '</tbody></table>';
        $('#tabela-livros').html(html);
    }

    return Livros;
})();

$(function() {
    var livros = new IFbooks.Livros();
    livros.iniciar();
});