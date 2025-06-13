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

        // $('#cancelar-edicao').on('click', function () {
        //     const modal = bootstrap.Modal.getInstance(document.getElementById('form-edicao'));
        //     modal.hide();
        // });

        fazerAlteraçãoDoLivro('#editar-livro-form');

        arrumarBackDropModal('#form-edicao');
    }
    
    function fazerAlteraçãoDoLivro(edicaoId) {
        $(edicaoId).on('submit', function (e) {
            e.preventDefault();

            const autorId = parseInt($('#edit-autor').val());

            verificarAutor(autorId)
                .then(() => {
                    const livroAtualizado = {
                        id: parseInt($('#edit-id').val()),
                        nome: $('#edit-nome').val(),
                        dataPublicacao: formatarDataBR($('#edit-data').val()),
                        editora: $('#edit-editora').val(),
                        resumo: $('#edit-resumo').val(),
                        autor: { id: autorId }
                    };
                    atualizarLivro(livroAtualizado);
                })
                .catch(() => {
                    const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                    toastErro.show();
                });
        });
    }

    function converterParaISO(dataBR) {
        const partes = dataBR.split('/');
        return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }

    function verificarAutor(id) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `http://localhost:8080/autores/${id}`,
                method: 'GET',
                success: function (autor) {
                        resolve(autor);
                    },
                error: function () {
                        reject();
                }
            });
        });
    }

    function arrumarBackDropModal(modalId) {
        $(modalId).on('hidden.bs.modal', function () {
            $('.modal-backdrop').remove();
            $('body').removeClass('modal-open');
            $('body').css('padding-right', '');
        });
    }
    function converterDataUSA(dataBR) {
        const partes = dataBR.split('/');
        return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    function formatarDataBR(dataISO) {
        const partes = dataISO.split("-");
        return `${partes[2]}/${partes[1]}/${partes[0]}`; // dd/MM/yyyy
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

    function deletarLivros(id) {
        $.ajax({
            url: `http://localhost:8080/livros/${id}`,
            method: 'DELETE',
            dataType: 'json',
            success: function() {
                alert("Livro excluido com Sucesso!");
                carregarLivros();  // recarraga nossa lista após a exclusão do livro especifico.
            },
            error: function() {
                $('#tabela-livros').html('<p class="text-danger">Erro ao carregar os livros.</p>');
            }
        });
    }

    function atualizarLivro(livro) {
        console.log(JSON.stringify(livro));
        $.ajax({
            url: `http://localhost:8080/livros/${livro.id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(livro),
            success: function() {
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('form-edicao'));
                modal.hide();

                

                const toastElement = document.getElementById('toast-sucesso');
                const toast = new bootstrap.Toast(toastElement);
                toast.show();

                $('#form-edicao').hide();
                carregarLivros();
            },
            error: function() {
                const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                toastErro.show();
            }
        });
    }

    function abrirFormularioEdicao(id) {
        $.ajax({
            url: `http://localhost:8080/livros/${id}`,
            method: 'GET',
            dataType: 'json',
            success: function (livro) {
                
                $('#edit-id').val(livro.id);
                $('#edit-nome').val(livro.nome);
                $('#edit-data').val(converterDataUSA(livro.dataPublicacao));
                $('#edit-editora').val(livro.editora);
                $('#edit-resumo').val(livro.resumo);
                $('#edit-autor').val(livro.autor.id);
                
                const modal = new bootstrap.Modal(document.getElementById('form-edicao'));
                modal.show()
            },
            error: function () {
                alert("Erro ao carregar os dados do livro.");
            }
        });
    }

    function adicionarEventosDosBotoes() {
        $('#tabela-livros').on('click', '.btn-editar', function() {
            const idLivro = $(this).data('id');

            abrirFormularioEdicao(idLivro);   
        });

        $('#tabela-livros').on('click', '.btn-excluir', function(){
            const idLivro = $(this).data('id');
            const confirmar = confirm('Tem certeza que deseja excluir o livro com ID: ' + idLivro + '?');

            if(confirmar) {
                console.log('Excluido o livro de id: ' + idLivro);

                // deletarLivros(idLivro);  para excluir de fato o id
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
                                '<th>Ações</th>' + 
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
                        <td>${livro.autor.id}</td>
                        <td>
                            <button class="btn-editar" data-id="${livro.id}">Editar</button>
                            <button class="btn-excluir" data-id="${livro.id}">Excluir</button>
                        </td>
                    </tr>`;
        });

        html += '</tbody></table>';
        $('#tabela-livros').html(html);

        adicionarEventosDosBotoes();
        
    }

    return Livros;
})();

$(function() {
    var livros = new IFbooks.Livros();
    livros.iniciar();
});