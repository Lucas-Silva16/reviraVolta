import { DeleteHistory } from '@/components/delete-history';
import { settings } from '@/lib/config';

export const metadata = { title: 'Privacidade e os teus dados' };

export default function Privacy() {
  const cfg = settings();

  return (
    <div className="page-width inner-page prose-page">
      <div className="page-heading">
        <span className="eyebrow">TRANSPARÊNCIA, EM CADA VOLTA</span>
        <h1>O teu gesto importa.<br /><span>A tua privacidade também.</span></h1>
        <p>Participas sem criar conta. Aqui explicamos o que guardamos, para quê e como podes apagar o teu histórico.</p>
      </div>

      <div className="prose-content">
        <section>
          <h2>O que guardamos quando registas um enchimento?</h2>
          <p>Guardamos <strong>o curso ou a opção «Docente» ou «Funcionário» que escolheste, os litros e a data e hora do registo</strong>. Cada enchimento recebe um número próprio e fica ligado a um código que reconhece este navegador, em vez do teu nome.</p>
          <p>Não pedimos nome, email ou número de aluno. A aplicação não guarda a tua localização, a estação onde encheste a garrafa ou o endereço da tua ligação à internet (IP). Não usamos publicidade nem ferramentas para seguir a tua navegação.</p>
        </section>

        <section>
          <h2>Para que serve esta informação?</h2>
          <p>Serve para te mostrar os teus enchimentos e o teu progresso. Também ajuda a avaliar este projeto universitário: queremos perceber se mostrar um objetivo partilhado pelo curso ou grupo incentiva a reutilização.</p>
          <p>Participar é uma escolha tua. Não registamos as páginas que visitas nem os teus cliques. Contamos os enchimentos que nos indicas; o QR code não confirma que a garrafa foi realmente enchida.</p>
        </section>

        <section>
          <h2>Como reconhecemos o teu histórico?</h2>
          <p>Guardamos um pequeno ficheiro neste navegador, chamado <strong>cookie</strong>, durante {cfg.cookieDays} dias. É ele que permite reconhecer o teu histórico quando regressas, sem te pedir uma conta. Na base de dados fica apenas uma versão protegida desse código.</p>
          <p><strong>Se apagares os cookies, usares navegação privada ou mudares de navegador, podes perder o acesso ao histórico anterior.</strong> Sem esse ficheiro, não conseguimos recuperá-lo para ti.</p>
          <p>Não guardar o teu nome reduz os riscos, mas não torna os registos completamente anónimos. Por exemplo, alguém que já conheça os teus hábitos poderá tirar conclusões a partir do grupo e dos horários.</p>
          <p>Se escolheres uma meta pessoal, ela fica guardada apenas neste navegador. Podes alterá-la ou retirá-la quando quiseres.</p>
        </section>

        <section>
          <h2>Porque é que algumas pessoas veem um lago?</h2>
          <p>Estamos a comparar duas versões da aplicação, atribuídas ao acaso e sem depender do curso ou grupo. Ambas mostram o teu progresso individual. Uma delas acrescenta um lago com o progresso coletivo. Continuas na mesma versão enquanto conservares o cookie neste navegador.</p>
          <p>O lago só mostra valores quando há pelo menos {cfg.minParticipants} participantes dessa versão no mesmo grupo. Os totais aparecem em intervalos de 5 litros, para dificultar a identificação de contribuições individuais. Não há classificações públicas de pessoas.</p>
        </section>

        <section>
          <h2>Quem pode ver os dados e durante quanto tempo?</h2>
          <p>Tu vês o teu histórico neste navegador. O docente responsável pela avaliação pode consultar e descarregar os registos para análise académica, sem nomes ou contactos. Os teus registos individuais não são publicados nem vendidos.</p>
          <p>O prazo de conservação é de <strong>{cfg.retentionDays} dias por registo</strong>. Está prevista uma limpeza diária dos registos que ultrapassem esse prazo. No fim do projeto, o responsável deve também apagar os dados, os ficheiros descarregados e as cópias de segurança, de acordo com os prazos definidos.</p>
          <p>Podes apagar o teu histórico aqui a qualquer momento. Se o docente já tiver descarregado uma cópia, a eliminação dessa cópia tem de ser feita pelo responsável pelo projeto.</p>
        </section>

        <DeleteHistory />

        <section>
          <h2>Precisas de ajuda com os teus dados?</h2>
          <p>Podes pedir para consultar, corrigir, receber uma cópia ou apagar os teus dados. Também podes pedir que a sua utilização seja limitada ou opor-te a ela, quando estes direitos se apliquem. Contacta o responsável pelo projeto, sem enviar cookies ou códigos do navegador.</p>
          <p>
            <strong>Responsável pelo projeto:</strong> {cfg.controller || 'Será indicado antes do início do estudo.'}<br />
            <strong>Contacto:</strong> {cfg.contact || 'Será disponibilizado antes do início do estudo.'}<br />
            <strong>Base legal para usar os dados:</strong> {cfg.lawfulBasis || 'Será definida e validada pela universidade antes do início do estudo.'}
          </p>
          <p>Podes deixar de participar quando quiseres. Se considerares que os teus direitos não foram respeitados, podes apresentar uma reclamação à autoridade de proteção de dados competente.</p>
          <p>O serviço que aloja o site também processa as ligações necessárias ao seu funcionamento. O responsável deve confirmar como esse serviço trata e protege os dados, pois isso não depende apenas da aplicação.</p>
        </section>
      </div>
    </div>
  );
}
