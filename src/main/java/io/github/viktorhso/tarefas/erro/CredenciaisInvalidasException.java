package io.github.viktorhso.tarefas.erro;

public class CredenciaisInvalidasException extends RuntimeException {

    public CredenciaisInvalidasException() {
        // Mensagem única para e-mail inexistente ou senha errada: não revela quais e-mails têm conta.
        super("E-mail ou senha inválidos.");
    }
}
