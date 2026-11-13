import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import Image from 'next/image';
import { validAdminSession } from '@/lib/auth';
import { adminCookie } from '@/lib/http';
import { settings } from '@/lib/config';
import { PrintButton } from '@/components/print-button';
import { Brand } from '@/components/header';
export const metadata = { title: 'QR code para o campus' };
export default async function QRPage() {
  if (!validAdminSession((await cookies()).get(adminCookie())?.value)) redirect('/admin');
  const cfg = settings(), url = `${cfg.origin}/`;
  const image = await QRCode.toDataURL(url, { width: 640, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#243B3B', light: '#ffffff' } });
  return <div className="page-width inner-page qr-page"><div className="no-print page-heading"><span className="eyebrow">UM CONVITE NO MOMENTO CERTO</span><h1>Uma nova volta começa aqui.</h1><p>O QR aponta para a origem configurada. Não inclui estação, localização, token ou parâmetros de tracking. Imprime e coloca junto dos enchedores.</p>{cfg.origin.includes('localhost') && <p className="warning-message">Este QR aponta para localhost e não funciona noutro dispositivo. Configura APP_ORIGIN com um endereço acessível antes de distribuir.</p>}</div><article className="qr-poster"><Brand/><span className="eyebrow">A TUA GARRAFA TEM MAIS VOLTAS PARA DAR</span><h2>Enche a tua garrafa.<br/><span>Faz a diferença.</span></h2><p>Enche. Regista. Acompanha o teu percurso.</p><Image src={image} width={280} height={280} unoptimized alt={`QR code para ${url}`}/><strong>Lê o QR e regista o teu enchimento.</strong><a href={url}>{url}</a><p className="fine-print">Sem conta. Participação voluntária.<br/>Curso, litros, data/hora e identificador pseudónimo.<br/>Privacidade e eliminação de dados disponíveis no site.</p><span className="poster-footer">Um projeto universitário de Persuasive Computing.</span></article><PrintButton/></div>;
}
