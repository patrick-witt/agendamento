import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../src/pages/Home';
import { useAuth } from '../src/context/AuthContext';
import { vi } from 'vitest';

vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock dependencies
vi.mock('../src/services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
  }
}));

describe('Wizard de Agendamento (Home)', () => {
  const renderWithAuth = (ui) => {
    useAuth.mockReturnValue({ signed: false, user: null, register: vi.fn() });
    return render(ui);
  };

  it('Renderiza o passo 1 corretamente', () => {
    renderWithAuth(<Home />);
    
    // Deve renderizar o título do passo 1
    expect(screen.getByRole('heading', { name: /Escolha o Serviço/i })).toBeInTheDocument();
  });

  it('Botão "Continuar" está desabilitado sem serviço selecionado', () => {
    renderWithAuth(<Home />);
    
    // O botão deve estar desabilitado inicialmente (nenhum serviço selecionado)
    const btn = screen.getByRole('button', { name: /Continuar/i });
    expect(btn).toBeDisabled();
  });
});
