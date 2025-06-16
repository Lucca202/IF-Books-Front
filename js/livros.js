/**
 * Livro: lcnato
 * data implementação? 23 / 05 / 2025
 * Utiliza ajax com jquery para consumir a API Ifbooks
 */
let livroParaExcluirId = null;

var IFbooks = IFbooks || {};

IFbooks.Livros = (function () {

    function Livros() { // construtor
        this.btnConsultarLivro = $('#btConsultar');
    }

    Livros.prototype.iniciar = function () {

        this.btnConsultarLivro.on('click', carregarLivros.bind(this));

        // $('#cancelar-edicao').on('click', function () {
        //     const modal = bootstrap.Modal.getInstance(document.getElementById('form-edicao'));
        //     modal.hide();
        // });
        fazerCriacaoDoLivro('#form-criar-livro');

        fazerAlteraçãoDoLivro('#editar-livro-form');
        fazerExclusaoDoLivro('#btn-confirmar-exclusao-modal');
        arrumarBackDropModal('#modal-criar-livro');
        arrumarBackDropModal('#form-edicao');
        arrumarBackDropModal('#modal-confirmar-exclusao');

    }
    // Funções De Requisições
    function fazerCriacaoDoLivro(formId) {
        $(formId).on('submit', function (e) {
            e.preventDefault();

            const autorId = parseInt($('#novo-autor').val());

            verificarAutor(autorId)
                .then(() => {
                    const novoLivro = {
                        nome: $('#novo-nome').val(),
                        dataPublicacao: formatarDataBR($('#novo-data').val()),
                        editora: $('#novo-editora').val(),
                        resumo: $('#novo-resumo').val(),
                        autor: { id: autorId }
                    };

                    $.ajax({
                        url: API_URI_LIVRO,
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(novoLivro),
                        success: function () {
                            const toast = new bootstrap.Toast(document.getElementById('toast-sucesso'));
                            toast.show();

                            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-criar-livro'));
                            modal.hide();

                            carregarLivros();
                        },
                        error: function () {
                            const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                            toastErro.show();
                        }
                    });
                })
                .catch(() => {
                    const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                    toastErro.show();
                });
        });
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
    function carregarLivros() {

        const valor = $('#consulta-id').val().trim();

        // Se estiver vazio, buscar todos
        if (valor === '') {
            $.ajax({
                url: API_URI_LIVRO,
                method: 'GET',
                dataType: 'json',
                success: exibirTabelaLivros.bind(this),
                error: function () {
                    $('#tabela-livros').html('<p class="text-danger">Erro ao carregar os livros.</p>');
                }
            });
            return;
        }

        // Se for número, buscar por ID específico
        if (!isNaN(valor)) {
            $.ajax({
                url: API_URI_LIVRO + `/${valor}`,
                method: 'GET',
                dataType: 'json',
                success: function (livro) {
                    exibirTabelaLivros([livro]); // coloca em array para reusar a mesma função
                },
                error: function () {
                    $('#tabela-livros').html('<p class="text-danger">Livro não encontrado.</p>');
                }
            });
        }
    }

    function deletarLivros(id) {
        $.ajax({
            url: API_URI_LIVRO + `/${id}`,
            method: 'DELETE',
            dataType: 'json',
            success: function () {
                const toastSucesso = new bootstrap.Toast(document.getElementById('toast-sucesso'));
                toastSucesso.show();

                const modal = bootstrap.Modal.getInstance(document.getElementById('modal-confirmar-exclusao'));
                if (modal) modal.hide();

                carregarLivros();
            },
            error: function () {
                const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                toastErro.show();
            }
        });
    }
    function atualizarLivro(livro) {
        console.log(JSON.stringify(livro));
        $.ajax({
            url: API_URI_LIVRO + `${livro.id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(livro),
            success: function () {

                const modal = bootstrap.Modal.getInstance(document.getElementById('form-edicao'));
                modal.hide();



                const toastElement = document.getElementById('toast-sucesso');
                const toast = new bootstrap.Toast(toastElement);
                toast.show();

                $('#form-edicao').hide();
                carregarLivros();
            },
            error: function () {
                const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                toastErro.show();
            }
        });
    }

    // Funções auxiliares das requisições 
    function verificarAutor(id) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: API_URN_AUTOR + `/${id}`,
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
    function fazerExclusaoDoLivro(exclusaoId) {
        $(exclusaoId).on('click', function () {
            $(exclusaoId).on('click', function () {
                if (livroParaExcluirId !== null) {
                    deletarLivros(livroParaExcluirId);
                }
            });
        });
    }
    function abrirFormularioEdicao(id) {
        $.ajax({
            url: API_URI_LIVRO + `/${id}`,
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
                const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                toastErro.show();
            }
        });
    }

    // Funções Extras 
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

    function adicionarEventosDosBotoes() {
        $('#tabela-livros').on('click', '.btn-editar', function () {
            const idLivro = $(this).data('id');

            abrirFormularioEdicao(idLivro);
        });

        $('#tabela-livros').on('click', '.btn-excluir', function () {
            livroParaExcluirId = $(this).data('id');
            const modal = new bootstrap.Modal(document.getElementById('modal-confirmar-exclusao'));
            modal.show();
        });


    }


    function exibirTabelaLivros(data) {
        // console.log("Entrei na função exibir")
        let html = '<table class="tabelas-livros">';
        html += '<thead>' +
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

        data.forEach(function (livro) {
            html += `<tr>
                        <td>${livro.id}</td>
                        <td>${livro.nome}</td>
                        <td>${livro.dataPublicacao}</td>
                        <td>${livro.editora}</td>
                        <td>${livro.resumo}</td>
                        <td>${livro.autor.id}</td>
                        <td>
                            <div class="d-flex flex-column flex-md-row gap-2">
                                <button class="btn btn-editar w-100" data-id="${livro.id}">Editar</button>
                                <button class="btn btn-excluir w-100" data-id="${livro.id}">Excluir</button>
                            </div>
                        </td>
                    </tr>`;
        });

        html += '</tbody></table>';
        $('#tabela-livros').html(html);

        adicionarEventosDosBotoes();

    }

    return Livros;
})();

$(function () {
    var livros = new IFbooks.Livros();
    livros.iniciar();
});