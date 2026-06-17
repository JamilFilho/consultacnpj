// Tabela de Natureza Jurídica — Anexo V da IN RFB nº 2.119/2022
// Uso: getNaturezaJuridica(data.codigo_natureza_juridica)

export const naturezaJuridicaMap: Record<number, string> = {
  // 1xxx — Administração Pública
  1015: "Órgão Público do Poder Executivo Federal. Um órgão público federal que integra a administração direta ou indireta, responsável por executar leis, gerir serviços públicos e implementar políticas governamentais.",
  1023: "Órgão Público do Poder Executivo Estadual ou do Distrito Federal. Órgão estadual ou do DF que faz parte da administração pública, executando políticas e serviços públicos em âmbito estadual ou distrital.",
  1031: "Órgão Público do Poder Executivo Municipal. Entidade municipal responsável pela execução de políticas públicas locais, prestação de serviços e gestão administrativa da cidade.",
  1040: "Órgão Público do Poder Legislativo Federal. Câmara dos Deputados e Senado Federal, responsáveis por legislar, fiscalizar e representar a população em nível nacional.",
  1058: "Órgão Público do Poder Legislativo Estadual ou do Distrito Federal. Assembleias Legislativas estaduais ou Câmara Legislativa do DF, que criam leis e fiscalizam o executivo regional.",
  1066: "Órgão Público do Poder Legislativo Municipal. Câmaras de Vereadores que legislam sobre assuntos municipais e fiscalizam o executivo local.",
  1074: "Órgão Público do Poder Judiciário Federal. Tribunais e juízes federais que julgam causas de âmbito nacional, como justiça federal e superior.",
  1082: "Órgão Público do Poder Judiciário Estadual. Tribunais e juízes estaduais que julgam questões de direito estadual e municipal.",
  1104: "Ministério Público. Instituição independente que defende a ordem jurídica, os direitos sociais e os interesses públicos.",
  1112: "Defensoria Pública. Órgão que presta assistência jurídica gratuita a pessoas que não podem pagar advogado.",
  1120: "Tribunal e Conselho de Contas. Entidades que fiscalizam a aplicação de recursos públicos e a gestão financeira do Estado.",
  1139: "Autarquia Federal. Entidade administrativa vinculada ao governo federal, com autonomia administrativa e financeira.",
  1147: "Autarquia Estadual ou do Distrito Federal. Entidade administrativa vinculada ao governo estadual ou do DF, com autonomia para executar políticas públicas.",
  1155: "Autarquia Municipal. Entidade administrativa vinculada ao município, responsável por serviços públicos locais.",
  1163: "Fundação Pública de Direito Público Federal. Organização criada pelo poder público federal para fins de interesse coletivo, sem fins lucrativos.",
  1171: "Fundação Pública de Direito Público Estadual ou do Distrito Federal. Fundação criada por entes estaduais ou do DF para desenvolvimento de atividades de interesse público.",
  1180: "Fundação Pública de Direito Público Municipal. Fundação criada por municípios para promover ações de interesse público local.",
  1198: "Órgão Público Autônomo Federal. Entidade federal com autonomia administrativa e financeira, vinculada ao Estado.",
  1201: "Órgão Público Autônomo Estadual ou do Distrito Federal. Entidade estadual ou do DF com autonomia administrativa e financeira.",
  1210: "Órgão Público Autônomo Municipal. Entidade municipal com autonomia administrativa e financeira para executar políticas locais.",
  1228: "Comissão Polinacional. Órgão de cooperação entre diferentes nações ou entidades públicas para projetos conjuntos.",
  1236: "Fundo Público. Reserva de recursos financeiros administrada pelo Estado para fins específicos de interesse público.",
  1244: "Consórcio Público de Direito Público (Associação Pública). Associação de entes públicos que se unem para executar serviços ou projetos comuns.",
  1252: "Consórcio Público de Direito Privado. Entidade formada por entes públicos e privados para gestão conjunta de recursos ou serviços.",
  1260: "Estado ou Distrito Federal. Unidade federativa que possui autonomia política e administrativa dentro da federação.",
  1279: "Município. Unidade administrativa local com governo próprio, responsável por serviços públicos municipais.",
  1287: "Fundação Pública de Direito Privado Federal. Fundação criada por entes federais, regida por direito privado, para fins de interesse público.",
  1295: "Fundação Pública de Direito Privado Estadual ou do Distrito Federal. Fundação de direito privado criada por entes estaduais ou do DF.",
  1309: "Fundação Pública de Direito Privado Municipal. Fundação de direito privado criada por municípios para atender demandas locais.",
  1317: "Serviço Social Autônomo. Entidade que presta serviços sociais de forma autônoma, sem fins lucrativos.",

  // 2xxx — Entidades Empresariais
  2011: "Empresa Pública. Empresa criada pelo Estado para exercer atividade econômica de interesse público.",
  2038: "Sociedade de Economia Mista. Empresa com participação do poder público e de acionistas privados.",
  2046: "Sociedade Anônima Aberta. Empresa de capital aberto, cujas ações são negociadas em bolsa de valores.",
  2054: "Sociedade Anônima Fechada. Empresa de capital fechado, cujas ações não são negociadas publicamente.",
  2062: "Sociedade Empresária Limitada. Empresa com responsabilidade limitada dos sócios ao capital social.",
  2070: "Sociedade Empresária em Nome Coletivo. Empresa onde os sócios respondem ilimitadamente pelas obrigações sociais.",
  2089: "Sociedade Empresária em Comandita Simples. Sociedade com sócios comanditados (responsáveis) e comanditários (investidores).",
  2097: "Sociedade Empresária em Comandita por Ações. Sociedade em que o capital é dividido em ações, com sócios comanditados e comanditários.",
  2100: "Sociedade Mercantil de Capital e Indústria (extinta). Tipo societário antigo que combinava capital e atividade industrial, já não mais existente.",
  2119: "Cooperativa. Associação de pessoas que se unem para produzir ou prestar serviços de forma coletiva.",
  2127: "Consórcio de Sociedades. União de duas ou mais sociedades para realização de projeto comum.",
  2135: "Grupo de Sociedades. Conjunto de empresas controladas por uma mesma holding ou grupo econômico.",
  2143: "Estabelecimento, no Brasil, de Sociedade Estrangeira. Filial de empresa estrangeira que opera no território brasileiro.",
  2151: "Estabelecimento, no Brasil, de Empresa Binacional Argentino-Brasileira. Empresa constituída por capital argentino e brasileiro, com atuação no Brasil.",
  2160: "Empresa Domiciliada no Exterior. Empresa registrada fora do Brasil, mas que pode ter operações no país.",
  2178: "Clube/Fundo de Investimento. Entidade que reúne recursos de investidores para aplicação em ativos financeiros.",
  2186: "Sociedade Simples Pura. Sociedade de prestação de serviços intelectuais, sem objetivo de lucro comercial.",
  2194: "Sociedade Simples Limitada. Sociedade simples com responsabilidade limitada dos sócios.",
  2208: "Sociedade Simples em Nome Coletivo. Sociedade simples onde os sócios respondem ilimitadamente.",
  2216: "Sociedade Simples em Comandita Simples. Sociedade simples com sócios comanditados e comanditários.",
  2224: "Empresa Individual de Responsabilidade Limitada (EIRELI) de Natureza Empresária. Empresa individual com responsabilidade limitada ao capital social, de natureza empresarial.",
  2232: "Empresa Individual de Responsabilidade Limitada (EIRELI) de Natureza Simples. EIRELI voltada a atividades de natureza simples, sem fins lucrativos.",
  2240: "Caixa Econômica. Instituição financeira pública que oferece serviços bancários e de crédito.",
  2259: "Sociedade Unipessoal de Advogados. Sociedade constituída por um único advogado para prestação de serviços jurídicos.",
  2267: "Cooperativa de Consumo. Organização de consumidores que se unem para adquirir bens e serviços em conjunto.",
  2275: "Empresa Simples de Inovação — Inova Simples. Empresa de pequeno porte voltada à inovação tecnológica.",
  2283: "Empresário (Individual). Pessoa física que exerce atividade empresarial por conta própria.",
  2291: "Empresa Individual de Responsabilidade Limitada (EIRELI) — uso futuro. Tipo societário previsto para uso futuro, ainda não regulamentado.",
  2305: "Organização de Cooperativas Brasileiras (OCB). Entidade que representa e coordena cooperativas em âmbito nacional.",
  2313: "Sociedade Anônima de Capital Autorizado. Sociedade anônima que possui capital autorizado superior ao capital emitido.",
  2321: "Sociedade Anônima Simplificada. Modelo simplificado de sociedade anônima, com menos formalidades.",

  // 3xxx — Entidades sem Fins Lucrativos
  3034: "Organização Social (OS). Entidade privada sem fins lucrativos que administra serviços públicos delegados.",
  3069: "Associação Privada. Organização sem fins lucrativos constituída por pessoas físicas ou jurídicas.",
  3077: "Fundação Privada. Entidade criada por pessoa física ou jurídica para fins de interesse público ou privado.",
  3085: "Serviço Notarial e Registral (Cartório). Órgão responsável por atos de registro público, como escrituras e certidões.",
  3093: "Fundação ou Associação Domiciliada no Exterior. Entidade estrangeira registrada fora do Brasil, mas reconhecida para fins legais.",
  3107: "Organização Religiosa. Instituição dedicada a práticas e crenças religiosas.",
  3115: "Comunidade Indígena. Grupo social reconhecido oficialmente como população indígena.",
  3123: "Fundo Privado. Entidade que reúne recursos de investidores para aplicação em ativos privados.",
  3131: "Órgão de Direção Nacional de Partido Político. Estrutura de liderança nacional de um partido político.",
  3140: "Órgão de Direção Regional de Partido Político. Estrutura de liderança regional de um partido político.",
  3158: "Órgão de Direção Local de Partido Político. Estrutura de liderança local de um partido político.",
  3166: "Comitê Financeiro de Partido Político. Órgão responsável pela arrecadação e gestão de recursos financeiros de um partido.",
  3174: "Frente Plebiscitária ou Referendária (extinta). Organização temporária criada para conduzir plebiscitos ou referendos, atualmente extinta.",
  3182: "Organização Sindical. Entidade que representa trabalhadores em negociações coletivas.",
  3190: "Condomínio Edilício. Forma de propriedade compartilhada de unidades residenciais ou comerciais.",
  3204: "Comissão de Conciliação Prévia. Órgão que busca a solução de conflitos trabalhistas antes da justiça.",
  3212: "Entidade de Mediação e Arbitragem. Instituição que oferece serviços de resolução alternativa de disputas.",
  3220: "Partido Político. Organização que busca exercer o poder político por meio de eleições.",
  3239: "Entidade Sindical. Organização que representa categorias profissionais em negociações coletivas.",
  3247: "Estabelecimento, no Brasil, de Fundação ou Associação Estrangeiras. Filial de fundação ou associação estrangeira que atua no Brasil.",
  3255: "Fundação ou Associação Estrangeira em Funcionamento no País. Entidade estrangeira que mantém operações dentro do território brasileiro.",
  3263: "Organização Religiosa Pluriconfessional. Entidade que congrega diversas confissões religiosas sob uma mesma estrutura.",

  // 4xxx — Pessoas Físicas
  4014: "Empresa Individual (Empresário Individual). Pessoa física que exerce atividade empresarial em nome próprio.",
  4022: "Candidato a Cargo Político Eletivo. Pessoa que se apresenta a eleições para ocupar cargo público.",
  4081: "Leiloeiro. Profissional responsável por conduzir leilões de bens móveis ou imóveis.",
  4090: "Produtor Rural (Pessoa Física). Pessoa física que exerce atividade agrícola ou pecuária.",

  // 5xxx — Organizações Internacionais e outras entidades extraterritoriais
  5010: "Organização Internacional. Entidade constituída por Estados ou organizações para cooperação global.",
  5029: "Representação Diplomática Estrangeira. Embaixada ou consulado que representa um país estrangeiro.",
  5037: "Outras Instituições Extraterritoriais. Entidades que operam fora do território nacional, como tribunais internacionais.",
};

/**
 * Retorna a descrição da natureza jurídica a partir do código numérico.
 * Fallback: "Natureza jurídica não identificada".
 */
export function getNaturezaJuridica(codigo: number | string): string {
  const key = typeof codigo === "string" ? parseInt(codigo, 10) : codigo;
  return naturezaJuridicaMap[key] ?? "Natureza jurídica não identificada";
}