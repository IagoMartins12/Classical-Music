Não há `loading.tsx` neste grupo, e é de propósito.

Um `loading.tsx` aqui cria um limite de `Suspense` no topo de **todas** as
páginas públicas. Com ele, o Next despacha a casca da página — já com HTTP 200
— antes de saber o desfecho. Quando a página depois chama `notFound()`, ou
quando a API falha, o status já foi enviado: a resposta sai **200 com a tela de
"não encontrado"**, que é o "soft 404" que os buscadores penalizam. Medido:
`/works/<id inexistente>` respondia 200 com o texto "Obra não encontrada".

Sem ele, o Next termina a renderização antes de responder e os status saem
certos: 404 para o que não existe, 500 para falha passageira da API, 200 só
para página de verdade. O custo é pequeno e foi medido — o render frio destas
páginas leva de 20 a 60 ms, e elas são guardadas em cache depois disso.

As listas que querem esqueleto (`composers`, `works`, `instruments`,
`music-history`, `teachers`) mantêm o `loading.tsx` **da própria rota**: elas
não têm caminho de "não encontrado", então o limite de `Suspense` ali não
falsifica status nenhum.
