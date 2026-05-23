import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../src/pages/Login';
import { useAuth } from '../src/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Tela de Login', () => {
  const mockLogin = vi.fn();

  const renderLogin = () => {
    useAuth.mockReturnValue({ login: mockLogin });
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('Renderiza campos de email e senha', () => {
    renderLogin();
    
    expect(screen.getByPlaceholderText(/admin@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\*\*\*\*\*\*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('Exibe erro com credenciais inválidas', async () => {
    // Simula erro de API vindo do mockLogin
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: 'Credenciais inválidas' } }
    });

    renderLogin();

    // Preenche e submete
    fireEvent.change(screen.getByPlaceholderText(/admin@example.com/i), { target: { value: 'teste@teste.com' } });
    fireEvent.change(screen.getByPlaceholderText(/\*\*\*\*\*\*/i), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar/i }));

    // Espera que a mensagem de erro apareça na tela
    await waitFor(() => {
      expect(screen.getByText(/Credenciais inválidas/i)).toBeInTheDocument();
    });
  });
});
