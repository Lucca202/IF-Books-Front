/**
 * Autor: lcnato
 * data implementação? 23 / 05 / 2025
 * Utiliza ajax com jquery para consumir a API Ifbooks
 */
let autorParaExcluirId = null;

var IFbooks = IFbooks || {};

IFbooks.Autores = (function () {

    function Autores() { // construtor
        this.btnConsultarAutor = $('#btConsultar');
    }

    Autores.prototype.iniciar = function () {

        this.btnConsultarAutor.on('click', carregarAutores.bind(this));

        fazerCriacaoDoAutor('#form-criar-autor');

        fazerAlteraçãoDoAutor('#editar-autor-form');
        fazerExclusaoDoAutor('#btn-confirmar-exclusao-modal');
        arrumarBackDropModal('#modal-criar-autor');
        arrumarBackDropModal('#form-edicao');
        arrumarBackDropModal('#modal-confirmar-exclusao');

    }


     /**
     * 
     *
     *  
     * 
     * 
     * 
     * 
     * 
     * 
     */
    // Metódos de Requisições do Banco de Dados
    function fazerCriacaoDoAutor(formId) {
        $(formId).on('submit', function (e) {
            e.preventDefault();

            const autorId = parseInt($('#novo-autor').val());
            console.log(autorId);

            const novoAutor = {
                nome: $('#novo-nome').val(),
                nacionalidade: $('#novo-nacionalidade').val(),
                dataNascimento: formatarDataBR($('#novo-data-nascimento').val()) // Adiciona esse campo no HTML também
            };

            $.ajax({
                url: API_URI_AUTOR,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(novoAutor),
                success: function () {
                    const toast = new bootstrap.Toast(document.getElementById('toast-sucesso'));
                    toast.show();

                    const modal = bootstrap.Modal.getInstance(document.getElementById('modal-criar-autor'));
                    modal.hide();

                    carregarAutores();
                },
                error: function () {
                    const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                    toastErro.show();
                }
            });
        });
    }

    function fazerAlteraçãoDoAutor(edicaoId) {
        $(edicaoId).on('submit', function (e) {
            e.preventDefault();

            const autorId = parseInt($('#edit-id').val());

            verificarAutor(autorId)
                .then(() => {
                    const autorAtualizado = {
                        id: autorId, // ✅ Adicione o ID aqui!
                        nome: $('#edit-nome').val(),
                        nacionalidade: $('#edit-nacionalidade').val(),
                        dataNascimento: formatarDataBR($('#edit-data-nascimento').val())
                    };
                    atualizarAutor(autorAtualizado);
                })
                .catch(() => {
                    const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                    toastErro.show();
                });
        });
    }



    function carregarAutores() {

        const valor = $('#nome').val().trim();

        // Se estiver vazio, buscar todos
        if (valor === '') {
            $.ajax({
                url: API_URI_AUTOR,
                method: 'GET',
                dataType: 'json',
                success: exibirTabelaAutores.bind(this),
                error: function () {
                    $('#tabela-autores').html('<p class="text-danger">Erro ao carregar os autores.</p>');
                }
            });
            return;
        }

        // Se for número, buscar por ID específico
        if (!isNaN(valor)) {
            $.ajax({
                url: API_URI_AUTOR + `/${valor}`,
                method: 'GET',
                dataType: 'json',
                success: function (autor) {
                    exibirTabelaAutores([autor]); // coloca em array para reusar a mesma função
                },
                error: function () {
                    $('#tabela-autores').html('<p class="text-danger">Autor não encontrado.</p>');
                }
            });
        }
    }

    function deletarAutores(id) {
        $.ajax({
            url: API_URI_AUTOR + `/${id}`,
            method: 'DELETE',
            dataType: 'json',
            success: function () {
                const toastSucesso = new bootstrap.Toast(document.getElementById('toast-sucesso'));
                toastSucesso.show();

                const modal = bootstrap.Modal.getInstance(document.getElementById('modal-confirmar-exclusao'));
                if (modal) modal.hide();

                carregarAutores();
            },
            error: function () {
                const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                toastErro.show();
            }
        });
    }

    function atualizarAutor(autor) {
        $.ajax({
            url: API_URI_AUTOR + `/${autor.id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(autor),
            success: function () {

                const modal = bootstrap.Modal.getInstance(document.getElementById('form-edicao'));
                modal.hide();



                const toastElement = document.getElementById('toast-sucesso');
                const toast = new bootstrap.Toast(toastElement);
                toast.show();

                $('#form-edicao').hide();
                carregarAutores();
            },
            error: function (xhr) {
                console.error("Erro ao atualizar:", xhr.status, xhr.responseText); // LOG DO ERRO AQUI
                const toastErro = new bootstrap.Toast(document.getElementById('toast-erro'));
                toastErro.show();
            }
        });
    }

    /**
     * 
     *
     *  
     * 
     * 
     * 
     * 
     * 
     * 
     */

    // Funções auxiliares das Requisições
    function fazerExclusaoDoAutor(exclusaoId) {
        $(exclusaoId).on('click', function () {
            if (autorParaExcluirId !== null) {
                deletarAutores(autorParaExcluirId);
            }
        });
    }

    function abrirFormularioEdicao(id) {
        $.ajax({
            url: API_URI_AUTOR + `/${id}`,
            method: 'GET',
            dataType: 'json',
            success: function (autor) {
                $('#edit-id').val(autor.id);
                $('#edit-nome').val(autor.nome);
                $('#edit-nacionalidade').val(autor.nacionalidade);

                if (autor.dataNascimento) {
                    $('#edit-data-nascimento').val(converterDataUSA(autor.dataNascimento)); // formato yyyy-MM-dd
                }

                const modal = new bootstrap.Modal(document.getElementById('form-edicao'));
                modal.show()
            },
            error: function () {
                alert("Erro ao carregar os dados do autor.");
            }
        });
    }

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

     /**
     * 
     *
     *  
     * 
     * 
     * 
     * 
     * 
     * 
     */

    // Funções de Exibição / resposta a Bugs / extras
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
        $('#tabela-autores').on('click', '.btn-editar', function () {
            const idAutor = $(this).data('id');

            abrirFormularioEdicao(idAutor);
        });

        $('#tabela-autores').on('click', '.btn-excluir', function () {
            autorParaExcluirId = $(this).data('id');
            const modal = new bootstrap.Modal(document.getElementById('modal-confirmar-exclusao'));
            modal.show();
        });

    }

    function exibirTabelaAutores(data) {
        let html = '<table class="tabela-autores">';
        html += '<thead class="thead-custom">' +
            '<tr>' +
            '<th class="thead-title">ID</th>' +
            '<th class="thead-title">Nome</th>' +
            '<th class="thead-title">Nacionalidade</th>' +
            '<th class="thead-title">Data de Nascimento</th>' +
            '<th class="thead-title">Ações</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

        data.forEach(function (autor) {
            html += `<tr class="rows-tabelas">
                        <td>${autor.id}</td>
                        <td>${autor.nome}</td>
                        <td>${autor.nacionalidade}</td>
                        <td>${autor.dataNascimento}</td>
                        <td>
                            <div class="d-flex flex-column flex-md-row gap-2">
                                <button class="btn btn-editar w-100" data-id="${autor.id}">Editar</button>
                                <button class="btn btn-excluir w-100" data-id="${autor.id}">Excluir</button>
                            </div>
                        </td>
                    </tr>`;

        });

        html += '</tbody></table>';

        $('#tabela-autores').html(html);

        adicionarEventosDosBotoes();

    }


    return Autores;
})();

// funções de criação 
$(function () {
    var autores = new IFbooks.Autores();
    autores.iniciar();
});