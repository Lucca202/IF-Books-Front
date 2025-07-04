/**
 * Autor: lcnato - BV 3044297
 * data implementação: 10 / 06 / 2025 
 * Utiliza ajax com jquery para consumir a API Ifbooks
 * permitindo a consulta, exclusão e manipulação dos Livros.
 * 
 */
let livroParaExcluirId = null;

var IFbooks = IFbooks || {};

IFbooks.Livros = (function () {

    function Livros() { // construtor
        this.btnConsultarLivro = $('#btConsultar');
    }

    Livros.prototype.iniciar = function () {

        this.btnConsultarLivro.on('click', carregarLivros.bind(this));

        fazerCriacaoDoLivro('#form-criar-livro');

        fazerAlteraçãoDoLivro('#editar-livro-form');

        arrumarBackDropModal('#modal-criar-livro');
        arrumarBackDropModal('#form-edicao');


        $('#modal-criar-livro').on('show.bs.modal', function () {
            carregarAutoresNoSelect('select-autor');
        });
    }
    // Funções De Requisições
    function fazerCriacaoDoLivro(formId) {
        $(formId).on('submit', function (e) {
            e.preventDefault();

            const autorId = parseInt($('#select-autor').val());


            verificarAutor(autorId)
                .then(() => {

                    if (checarDataFutura($('#novo-data').val())) {
                        return;
                    };

                    const novoLivro = {
                        nome: $('#novo-nome').val(),
                        dataPublicacao: formatarDataBR($('#novo-data').val()),
                        editora: $('#novo-editora').val(),
                        resumo: $('#novo-resumo').val(),
                        autor: { id: autorId }
                    };

                    // console.log(JSON.stringify(livro));


                    $.ajax({
                        url: API_URI_LIVRO,
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(novoLivro),
                        success: function () {
                            mostrarToastSucesso('Livro criado com sucesso!');

                            const modal = bootstrap.Modal.getInstance(document.getElementById('modal-criar-livro'));
                            document.activeElement.blur();
                            modal.hide();

                            carregarLivros();
                        },
                        error: function (xhr) {
                            console.error('Erro ao adicionar:', xhr.responseText);
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

    function carregarAutoresNoSelect(selectId, autorSelecionadoId = null) {
        $.get(`${API_URI_AUTOR}`, function (autores) {
            const select = $(`#${selectId}`);
            select.empty();
            select.append('<option value="">Selecione um autor</option>');
            autores.forEach(autor => {
                const selected = autorSelecionadoId && autor.id == autorSelecionadoId ? 'selected' : '';
                select.append(`<option value="${autor.id}" ${selected}>${autor.nome}</option>`);
            });
        });
    }

    function fazerAlteraçãoDoLivro(edicaoId) {
        $(edicaoId).on('submit', function (e) {
            e.preventDefault();

            const autorId = parseInt($('#edit-select-autor').val());

            if (checarDataFutura($('#edit-data').val())) {
                return;
            }

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
                if (modal) {
                    document.activeElement.blur();
                    modal.hide();
                }

                carregarLivros();
            },
            error: function () {
                const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                toastErro.show();
            }
        });
    }
    function atualizarLivro(livro) {
        $.ajax({
            url: API_URI_LIVRO + `/${livro.id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(livro),
            success: function () {

                const modal = bootstrap.Modal.getInstance(document.getElementById('form-edicao'));
                document.activeElement.blur();
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
                url: API_URI_AUTOR + `/${id}`,
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

                carregarAutoresNoSelect('edit-select-autor', livro.autor.id);

                const modal = new bootstrap.Modal(document.getElementById('form-edicao'));
                modal.show()
            },
            error: function () {
                const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                toastErro.show();
            }
        });
    }


    function mostrarToastSucesso(mensagem) {
        const toastEl = document.getElementById('toast-sucesso');

        // Atualiza a mensagem da toast-body
        $('#toast-sucesso .toast-body').text(mensagem);

        // Inicializa o toast (ou reaproveita instância)
        const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
        toast.show();
    }
    function mostrarToastErro(mensagem) {
        const toastEl = document.getElementById('toast-erro');

        // Atualiza a mensagem da toast-body
        $('#toast-erro .toast-body').text(mensagem);

        // Inicializa o toast (ou reaproveita instância)
        const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
        toast.show();
    }

    function checarDataFutura(dataPublicacaoInput) {
        const dataPublicacao = new Date(dataPublicacaoInput);
        const hoje = new Date();

        dataPublicacao.setHours(0, 0, 0, 0);
        hoje.setHours(0, 0, 0, 0);


        if (dataPublicacao > hoje) {
            const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
            $('#toast-erro .toast-body').text('A data de publicação não pode ser no futuro.');
            toastErro.show();
            return true;
        }

        return false;
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
            const id = $(this).data('id');

            Swal.fire({
                title: 'Tem certeza?',
                text: 'Você realmente deseja excluir este livro?',
                icon: 'warning',
                customClass: {
                    popup: 'meu-popup',
                    confirmButton: 'meu-botao-confirmar',
                    cancelButton: 'meu-botao-cancelar'
                },
                showCancelButton: true,
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    deletarLivros(id);
                }
            });
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
                        <td>${livro.autor.nome}</td>
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