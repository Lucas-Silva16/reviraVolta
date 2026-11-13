'use client';
import { Printer } from 'lucide-react';
export function PrintButton() { return <button className="button primary no-print" onClick={() => window.print()}><Printer size={17}/> Imprimir cartaz</button>; }
