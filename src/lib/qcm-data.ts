// ============================================================
// QCM Examen Civique 2026 - Complete Data
// 5 thématiques, 40 questions par examen, corrections détaillées
// ============================================================

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'connaissance' | 'mise-en-situation';
}

export interface QuizSerie {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Theme {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  questionCount: number;
  subThemes: string[];
  pointsVigilance: string;
  series: QuizSerie[];
}

// ============================================================
// THÈME 1 : Principes et valeurs de la République (11 questions)
// ============================================================
const principesValeurs: Theme = {
  id: 'principes-valeurs',
  slug: 'principes-valeurs-republique',
  title: 'Principes et valeurs de la République',
  shortTitle: 'Principes et valeurs',
  icon: '🏛️',
  description: 'La devise « Liberté, Égalité, Fraternité », les symboles de la République, la laïcité et l\'application concrète des valeurs républicaines dans des situations de vie courante.',
  questionCount: 11,
  subThemes: ['Devise et symboles de la République', 'Laïcité', 'Mises en situation'],
  pointsVigilance: 'Thématique la plus lourde : 6 mises en situation sur 11 questions',
  series: [
    {
      id: 'principes-serie-1',
      title: 'QCM Principes et valeurs de la République - Série n°1',
      description: '11 questions couvrant la devise, les symboles, la laïcité et des mises en situation.',
      questions: [
        {
          id: 'p1-1',
          text: 'Quelle est la devise de la République française ?',
          options: [
            'Liberté, Égalité, Fraternité',
            'Travail, Famille, Patrie',
            'Liberté, Unité, Égalité',
            'Fraternité, Solidarité, Justice'
          ],
          correctAnswer: 0,
          explanation: 'La devise de la République française est « Liberté, Égalité, Fraternité ». Elle est inscrite dans la Constitution de 1958 (article 2). Elle trouve ses origines dans la Révolution française de 1789 et a été définitivement adoptée sous la Troisième République en 1880.',
          type: 'connaissance'
        },
        {
          id: 'p1-2',
          text: 'Que signifie le principe de laïcité en France ?',
          options: [
            'L\'État interdit toutes les religions',
            'L\'État est séparé des religions et garantit la liberté de conscience',
            'Seule la religion catholique est reconnue',
            'Les religions sont soumises au contrôle de l\'État'
          ],
          correctAnswer: 1,
          explanation: 'La laïcité repose sur la loi de séparation des Églises et de l\'État du 9 décembre 1905. Elle implique la neutralité de l\'État vis-à-vis des religions, la liberté de conscience et le libre exercice des cultes. L\'État ne subventionne aucun culte.',
          type: 'connaissance'
        },
        {
          id: 'p1-3',
          text: 'Quel est le symbole officiel de la République française ?',
          options: [
            'Le coq gaulois',
            'La Marianne',
            'Le drapeau tricolore uniquement',
            'La fleur de lys'
          ],
          correctAnswer: 1,
          explanation: 'Marianne est le symbole officiel de la République française. Son visage orne les mairies, les tribunaux et les documents officiels. Elle représente les valeurs de la République : liberté, raison et nation. Le buste de Marianne est présent dans toutes les mairies de France.',
          type: 'connaissance'
        },
        {
          id: 'p1-4',
          text: 'Mise en situation : Marie, fonctionnaire, travaille dans une mairie. Elle souhaite porter un voile religieux sur son lieu de travail. Que prévoit la loi ?',
          options: [
            'Elle peut porter un signe religieux discret',
            'Elle doit respecter le principe de neutralité et ne pas porter de signe religieux visible',
            'Elle peut porter un signe religieux si elle le souhaite',
            'La loi ne dit rien sur ce sujet'
          ],
          correctAnswer: 1,
          explanation: 'Les agents publics (fonctionnaires) sont soumis à une obligation de neutralité. Le Conseil d\'État a confirmé que cette obligation interdit le port de signes religieux visibles dans l\'exercice de leurs fonctions. Cette règle découle du principe de laïcité de l\'État.',
          type: 'mise-en-situation'
        },
        {
          id: 'p1-5',
          text: 'Quelle valeur de la devise garantit que chaque citoyen a les mêmes droits ?',
          options: [
            'Liberté',
            'Égalité',
            'Fraternité',
            'Laïcité'
          ],
          correctAnswer: 1,
          explanation: 'L\'égalité garantit que tous les citoyens ont les mêmes droits et les mêmes devoirs, sans distinction d\'origine, de sexe, de religion ou d\'opinion. Elle est le fondement du principe républicain selon lequel nul ne doit être favorisé ou défavorisé en raison de sa naissance ou de sa condition.',
          type: 'connaissance'
        },
        {
          id: 'p1-6',
          text: 'Mise en situation : Ahmed est salarié dans une entreprise privée. Son employeur lui interdit de porter une barbe pour des raisons religieuses. Que dit la loi ?',
          options: [
            'L\'employeur peut interdire la barbe sans condition',
            'L\'employeur ne peut pas interdire la barbe si elle est motivée par une conviction religieuse, sauf exigence professionnelle légitime',
            'La barbe est toujours interdite au travail',
            'Ahmed doit choisir entre sa barbe et son emploi'
          ],
          correctAnswer: 1,
          explanation: 'Dans le secteur privé, la liberté religieuse est protégée. Un employeur ne peut pas interdire le port d\'une barbe religieuse sauf si cette restriction est justifiée par la nature de la tâche à accomplir et proportionnée au but recherché (arrêt de la Cour de cassation).',
          type: 'mise-en-situation'
        },
        {
          id: 'p1-7',
          text: 'Quelle loi instaure la séparation des Églises et de l\'État ?',
          options: [
            'La loi du 15 mars 2004',
            'La loi du 9 décembre 1905',
            'La loi du 11 octobre 1946',
            'La loi du 4 août 1789'
          ],
          correctAnswer: 1,
          explanation: 'La loi du 9 décembre 1905, dite « loi de séparation des Églises et de l\'État », est le texte fondateur de la laïcité en France. Elle dispose que la République ne reconnaît, ne salarie ni ne subventionne aucun culte et garantit le libre exercice des cultes.',
          type: 'connaissance'
        },
        {
          id: 'p1-8',
          text: 'Mise en situation : Sophie, élève au lycée, souhaite porter un foulard islamique en cours. Que prévoit la loi ?',
          options: [
            'Elle peut le porter librement au lycée',
            'La loi interdit le port de signes religieux ostensibles dans les écoles publiques',
            'Seuls les signes discrets sont autorisés',
            'Cela dépend du règlement intérieur de chaque lycée'
          ],
          correctAnswer: 1,
          explanation: 'Depuis la loi du 15 mars 2004, le port de signes ou tenues par lesquels les élèves manifestent ostensiblement une appartenance religieuse est interdit dans les écoles, collèges et lycées publics. Le foulard islamique, la kippa ou les croix de taille ostensible sont concernés.',
          type: 'mise-en-situation'
        },
        {
          id: 'p1-9',
          text: 'Mise en situation : Un maire refuse d\'organiser un repas de noces en mairie pour un couple en raison de leur orientation sexuelle. Que prévoit la loi ?',
          options: [
            'Le maire a le droit de refuser selon ses convictions',
            'Le maire doit célébrer le mariage car tous les citoyens sont égaux devant la loi',
            'Le maire peut refuser si le conseil municipal l\'approuve',
            'La question n\'est pas réglée par la loi'
          ],
          correctAnswer: 1,
          explanation: 'Le principe d\'égalité impose au maire, en tant qu\'officier d\'état civil, de célébrer les mariages remplissant les conditions légales, sans discrimination. Depuis la loi du 17 mai 2013, le mariage est ouvert aux couples de même sexe. Un refus discriminatoire constitue une infraction pénale.',
          type: 'mise-en-situation'
        },
        {
          id: 'p1-10',
          text: 'Le principe de fraternité implique notamment :',
          options: [
            'L\'obligation de s\'engager dans une association',
            'La solidarité entre citoyens et le devoir de porter secours',
            'Le droit de ne pas aider son prochain',
            'L\'appartenance obligatoire à un parti politique'
          ],
          correctAnswer: 1,
          explanation: 'La fraternité est le troisième pilier de la devise républicaine. Elle implique la solidarité entre citoyens et le devoir de porter assistance à personne en danger (article 223-6 du Code pénal). Elle fonde également la sécurité sociale et les politiques de solidarité nationale.',
          type: 'connaissance'
        },
        {
          id: 'p1-11',
          text: 'Mise en situation : Pierre est témoin d\'un accident de la route mais ne porte pas secours à la victime. Que risque-t-il ?',
          options: [
            'Rien, il n\'a aucune obligation légale',
            'Il risque des peines pénales pour non-assistance à personne en danger',
            'Il risque seulement une amende civile',
            'Seul un professionnel de santé est tenu de porter secours'
          ],
          correctAnswer: 1,
          explanation: 'L\'article 223-6 du Code pénal punit de 5 ans d\'emprisonnement et 75 000 euros d\'amende le fait de s\'abstenir volontairement de porter assistance à une personne en péril. Ce devoir de secours découle du principe constitutionnel de fraternité.',
          type: 'mise-en-situation'
        }
      ]
    },
    {
      id: 'principes-serie-2',
      title: 'QCM Principes et valeurs de la République - Série n°2',
      description: '11 questions supplémentaires sur la devise, les symboles, la laïcité et les mises en situation.',
      questions: [
        {
          id: 'p2-1',
          text: 'Quelle est la langue officielle de la République française ?',
          options: [
            'L\'anglais et le français',
            'Le français',
            'Le français et les langues régionales',
            'Il n\'y a pas de langue officielle'
          ],
          correctAnswer: 1,
          explanation: 'L\'article 2 de la Constitution dispose : « La langue de la République est le français. » Depuis la loi Toubon de 1994, le français est la langue obligatoire dans les administrations, l\'enseignement, les contrats de travail et la publicité.',
          type: 'connaissance'
        },
        {
          id: 'p2-2',
          text: 'Le drapeau français est composé de trois couleurs. Dans quel ordre, de gauche à droite ?',
          options: [
            'Rouge, Blanc, Bleu',
            'Bleu, Blanc, Rouge',
            'Blanc, Bleu, Rouge',
            'Bleu, Rouge, Blanc'
          ],
          correctAnswer: 1,
          explanation: 'Le drapeau tricolore est composé de trois bandes verticales : bleu à la hampe (gauche), blanc au centre, rouge au battant (droite). Adopté en 1794, il est l\'un des emblèmes nationaux prévus par la Constitution.',
          type: 'connaissance'
        },
        {
          id: 'p2-3',
          text: 'La Marseillaise est :',
          options: [
            'L\'hymne de l\'Union européenne',
            'L\'hymne national de la République française',
            'Un chant religieux',
            'L\'hymne de la ville de Marseille uniquement'
          ],
          correctAnswer: 1,
          explanation: 'La Marseillaise est l\'hymne national de la France, composé par Rouget de Lisle en 1792. Elle a été déclarée chant national le 14 juillet 1795 et rétablie comme hymne national sous la Troisième République en 1879.',
          type: 'connaissance'
        },
        {
          id: 'p2-4',
          text: 'Mise en situation : Un employeur demande à une femme de retirer son voile pour travailler au contact du public. Cette exigence est-elle légale ?',
          options: [
            'Non, c\'est une discrimination',
            'Oui, si cette exigence est justifiée par une exigence professionnelle essentielle et déterminante et proportionnée au but recherché',
            'Oui, sans condition',
            'Non, sauf dans les administrations publiques'
          ],
          correctAnswer: 1,
          explanation: 'Depuis l\'arrêt de la Cour de cassation du 22 novembre 2017 (affaire Baby Loup), une entreprise privée peut restreindre la liberté religieuse de ses salariés si cette restriction est justifiée par la nature de la tâche à accomplir et proportionnée au but recherché.',
          type: 'mise-en-situation'
        },
        {
          id: 'p2-5',
          text: 'La liberté de conscience signifie :',
          options: [
            'Le droit d\'imposer ses croyances aux autres',
            'Le droit de croire ou de ne pas croire, et de changer de religion',
            'L\'obligation de pratiquer une religion',
            'Le droit de pratiquer uniquement la religion dominante'
          ],
          correctAnswer: 1,
          explanation: 'La liberté de conscience, garantie par l\'article 10 de la Déclaration des droits de l\'homme et du citoyen de 1789, comprend le droit de croire ou de ne pas croire, le droit de changer de conviction et le droit de manifester ses croyances dans les limites de l\'ordre public.',
          type: 'connaissance'
        },
        {
          id: 'p2-6',
          text: 'Mise en situation : Dans un hôpital public, une patiente demande à être soignée uniquement par un médecin femme pour des raisons religieuses. L\'hôpital :',
          options: [
            'Doit obligatoirement accéder à cette demande',
            'Peut prendre en compte cette demande dans la mesure du possible, mais le principe de laïcité ne l\'y oblige pas',
            'Doit refuser catégoriquement',
            'Doit demander un certificat religieux'
          ],
          correctAnswer: 1,
          explanation: 'Le service public hospitalier peut tenir compte des convictions religieuses des patients dans la mesure du possible et de l\'organisation du service. Cependant, la laïcité du service public ne crée pas d\'obligation de satisfaire systématiquement les demandes liées à la religion.',
          type: 'mise-en-situation'
        },
        {
          id: 'p2-7',
          text: 'Quels sont les trois symboles officiels de la République française ?',
          options: [
            'Le coq, le drapeau tricolore et la Marseillaise',
            'Le drapeau tricolore, la devise « Liberté, Égalité, Fraternité » et la Marseillaise',
            'Marianne, le drapeau et le coq',
            'La fleur de lys, la Marseillaise et le drapeau'
          ],
          correctAnswer: 1,
          explanation: 'L\'article 2 de la Constitution énonce les trois emblèmes nationaux : le drapeau tricolore (bleu, blanc, rouge), la devise « Liberté, Égalité, Fraternité » et l\'hymne national « La Marseillaise ». Le coq gaulois est un symbole traditionnel mais pas constitutionnel.',
          type: 'connaissance'
        },
        {
          id: 'p2-8',
          text: 'Mise en situation : Un enfant refuse, au nom de ses convictions religieuses, de participer à un cours de natation mixte à l\'école. Que prévoit la jurisprudence ?',
          options: [
            'L\'école doit exempter l\'enfant de ce cours',
            'L\'école n\'est pas tenue d\'accorder une dispense pour motif religieux dans un cours obligatoire',
            'Les parents peuvent retirer l\'enfant sans justification',
            'L\'école doit organiser des cours séparés par sexe'
          ],
          correctAnswer: 1,
          explanation: 'La jurisprudence administrative (Conseil d\'État) considère que l\'obligation de mixité et le programme scolaire obligatoire prévalent sur les convictions religieuses. Les parents ne peuvent pas opposer leurs convictions pour dispenser leur enfant d\'un enseignement obligatoire.',
          type: 'mise-en-situation'
        },
        {
          id: 'p2-9',
          text: 'Le 14 juillet est la fête nationale. Elle commémore :',
          options: [
            'La victoire de la Première Guerre mondiale',
            'La prise de la Bastille en 1789 et la fête de la Fédération en 1790',
            'L\'élection du premier président de la République',
            'La signature de la Constitution de 1958'
          ],
          correctAnswer: 1,
          explanation: 'La fête nationale du 14 juillet commémore deux événements : la prise de la Bastille le 14 juillet 1789, symbole de la fin de l\'absolutisme, et la fête de la Fédération le 14 juillet 1790, symbole de l\'unité nationale. Elle a été instaurée en 1880.',
          type: 'connaissance'
        },
        {
          id: 'p2-10',
          text: 'Mise en situation : Une association demande à une mairie de mettre à disposition une salle pour un événement religieux. La mairie :',
          options: [
            'Doit obligatoirement refuser au nom de la laïcité',
            'Peut mettre à disposition la salle de manière neutre, sans financer ni privilégier un culte',
            'Doit accepter uniquement si c\'est le culte majoritaire',
            'Ne peut jamais mettre de salle à disposition pour un culte'
          ],
          correctAnswer: 1,
          explanation: 'La mise à disposition d\'une salle municipale pour un culte n\'est pas interdite en soi, à condition que la commune le fasse de manière neutre et non discriminatoire, sans financer ni privilégier un culte particulier. Le Conseil d\'État a précisé cette jurisprudence.',
          type: 'mise-en-situation'
        },
        {
          id: 'p2-11',
          text: 'Le principe de liberté dans la devise signifie notamment :',
          options: [
            'Le droit de faire tout ce que l\'on veut sans limites',
            'Le droit de faire tout ce qui ne nuit pas à autrui, dans le cadre de la loi',
            'Le droit de ne pas payer d\'impôts',
            'La liberté de circuler sans passeport'
          ],
          correctAnswer: 1,
          explanation: 'La liberté, telle que définie par la Déclaration des droits de l\'homme et du citoyen de 1789 (article 4), consiste à pouvoir faire tout ce qui ne nuit pas à autrui. L\'exercice des libertés est limité par le respect des droits d\'autrui et l\'ordre public défini par la loi.',
          type: 'connaissance'
        }
      ]
    }
  ]
};

// ============================================================
// THÈME 2 : Droits et devoirs (11 questions)
// ============================================================
const droitsDevoirs: Theme = {
  id: 'droits-devoirs',
  slug: 'droits-et-devoirs',
  title: 'Droits et devoirs',
  shortTitle: 'Droits et devoirs',
  icon: '⚖️',
  description: 'Les droits fondamentaux, les obligations légales et l\'application concrète des droits et devoirs dans des situations de vie courante.',
  questionCount: 11,
  subThemes: ['Droits fondamentaux', 'Obligations légales', 'Mises en situation'],
  pointsVigilance: '6 mises en situation : questions souvent formulées en cas pratique',
  series: [
    {
      id: 'droits-serie-1',
      title: 'QCM Droits et devoirs - Série n°1',
      description: '11 questions sur les droits fondamentaux, les obligations légales et les mises en situation.',
      questions: [
        {
          id: 'd1-1',
          text: 'Quel texte fondateur énonce les droits naturels et imprescriptibles de l\'homme ?',
          options: [
            'La Constitution de 1958',
            'La Déclaration des droits de l\'homme et du citoyen de 1789',
            'La Charte de l\'environnement',
            'Le Code civil'
          ],
          correctAnswer: 1,
          explanation: 'La Déclaration des droits de l\'homme et du citoyen (DDHC) du 26 août 1789 énonce les droits « naturels, inaliénables et sacrés » de l\'homme : liberté, propriété, sûreté, résistance à l\'oppression. Elle est intégrée au bloc de constitutionnalité français.',
          type: 'connaissance'
        },
        {
          id: 'd1-2',
          text: 'En France, l\'âge de la majorité est de :',
          options: [
            '16 ans',
            '18 ans',
            '21 ans',
            '17 ans'
          ],
          correctAnswer: 1,
          explanation: 'La majorité légale est fixée à 18 ans en France depuis la loi du 5 juillet 1974. À cet âge, une personne acquiert la capacité juridique pleine et entière : droit de vote, capacité de conclure des contrats, obligation de répondre de ses actes pénalement.',
          type: 'connaissance'
        },
        {
          id: 'd1-3',
          text: 'Mise en situation : Jean est licencié par son employeur sans motif. Que peut-il faire ?',
          options: [
            'Rien, l\'employeur peut licencier sans motif',
            'Contester le licenciement devant le conseil de prud\'hommes',
            'Demander uniquement une indemnité au chômage',
            'Porter plainte au commissariat'
          ],
          correctAnswer: 1,
          explanation: 'Tout salarié peut contester un licenciement abusif devant le conseil de prud\'hommes. L\'employeur doit justifier le licenciement par un motif réel et sérieux. En l\'absence de motif, le licenciement est qualifié d\'abusif et ouvre droit à des dommages et intérêts.',
          type: 'mise-en-situation'
        },
        {
          id: 'd1-4',
          text: 'Le droit d\'asile est garanti par :',
          options: [
            'Le Code du travail uniquement',
            'La Constitution française et la Convention de Genève de 1951',
            'Le Code civil uniquement',
            'Le droit européen uniquement'
          ],
          correctAnswer: 1,
          explanation: 'Le droit d\'asile est garanti par l\'article 53-1 de la Constitution française et par la Convention de Genève du 28 juillet 1951. Toute personne persécutée en raison de son origine, de sa religion ou de ses opinions peut demander l\'asile en France.',
          type: 'connaissance'
        },
        {
          id: 'd1-5',
          text: 'Mise en situation : Fatima, locataire, reçoit un congé de son propriétaire en plein hiver. Le propriétaire peut-il l\'expulser immédiatement ?',
          options: [
            'Oui, le propriétaire peut expulser quand il veut',
            'Non, la trêve hivernale interdit les expulsions du 1er novembre au 31 mars',
            'Oui, avec une autorisation du maire',
            'Non, une expulsion nécessite toujours 2 ans de préavis'
          ],
          correctAnswer: 1,
          explanation: 'La trêve hivernale (période de suspension des expulsions locatives) s\'applique du 1er novembre au 31 mars de chaque année. Pendant cette période, aucune expulsion ne peut être réalisée, sauf exceptions limitées (occupation sans droit ni titre d\'un immeuble, relogement assuré).',
          type: 'mise-en-situation'
        },
        {
          id: 'd1-6',
          text: 'Parmi ces obligations, laquelle est un devoir du citoyen français ?',
          options: [
            'Voter à toutes les élections',
            'Payer ses impôts',
            'S\'engager dans une association',
            'Servir dans l\'armée'
          ],
          correctAnswer: 1,
          explanation: 'Le paiement des impôts est un devoir civique fondamental prévu par l\'article 13 de la DDHC de 1789. Il contribue au financement des services publics et de la solidarité nationale. Le service national est aujourd\'ui universel mais pas obligatoire au sens militaire.',
          type: 'connaissance'
        },
        {
          id: 'd1-7',
          text: 'Mise en situation : Un employeur paie un salarié en dessous du SMIC. Que risque-t-il ?',
          options: [
            'Rien si le salarié est d\'accord',
            'Des sanctions pénales et le paiement d\'un rappel de salaire',
            'Un simple avertissement',
            'Seulement le paiement du rappel de salaire'
          ],
          correctAnswer: 1,
          explanation: 'Le non-respect du SMIC est un délit pénal puni d\'une amende de 1 500 euros (3 000 euros en cas de récidive) par salarié concerné. L\'employeur doit également verser un rappel de salaire avec des indemnités pour retard de paiement.',
          type: 'mise-en-situation'
        },
        {
          id: 'd1-8',
          text: 'Le droit à l\'éducation est :',
          options: [
            'Un droit réservé aux citoyens français',
            'Un droit garanti par la Constitution et la Déclaration universelle des droits de l\'homme',
            'Un privilège accordé uniquement aux enfants de familles aisées',
            'Un droit applicable uniquement dans l\'enseignement public'
          ],
          correctAnswer: 1,
          explanation: 'Le droit à l\'éducation est garanti par le préambule de la Constitution de 1946 (droits sociaux) et par l\'article 26 de la Déclaration universelle des droits de l\'homme. L\'instruction est obligatoire de 3 à 16 ans en France, dans le public ou le privé.',
          type: 'connaissance'
        },
        {
          id: 'd1-9',
          text: 'Mise en situation : Marc est victime de discrimination à l\'embauche en raison de son âge. Que peut-il faire ?',
          options: [
            'Rien, l\'employeur est libre de recruter qui il veut',
            'Saisir le Défenseur des droits et/ou le conseil de prud\'hommes',
            'Uniquement déposer une plainte pénale',
            'Contacter uniquement son syndicat'
          ],
          correctAnswer: 1,
          explanation: 'La discrimination à l\'embauche est interdite par la loi. La victime peut saisir le Défenseur des droits, le conseil de prud\'hommes ou porter plainte. L\'employeur doit prouver que sa décision est justifiée par des éléments objectifs, étrangers à toute discrimination.',
          type: 'mise-en-situation'
        },
        {
          id: 'd1-10',
          text: 'En France, le mariage est possible à partir de :',
          options: [
            '16 ans pour tous',
            '18 ans pour tous',
            '15 ans avec consentement parental',
            '21 ans pour tous'
          ],
          correctAnswer: 1,
          explanation: 'Depuis 2006, l\'âge minimal du mariage est fixé à 18 ans pour les hommes et les femmes, sans dérogation possible. Auparavant, des dispenses étaient possibles à 15 ans. Cette réforme vise à lutter contre les mariages forcés.',
          type: 'connaissance'
        },
        {
          id: 'd1-11',
          text: 'Mise en situation : Amira, enceinte, apprend que son employeur souhaite la licencier. Que prévoit la loi ?',
          options: [
            'L\'employeur peut la licencier sans restriction',
            'Le licenciement est interdit pendant la grossesse et le congé maternité, sauf faute grave',
            'Elle doit démissionner pour toucher les allocations',
            'Le licenciement est possible avec un préavis doublé'
          ],
          correctAnswer: 1,
          explanation: 'Le Code du travail (article L1225-4) interdit le licenciement d\'une salariée pendant la grossesse et le congé maternité, sauf en cas de faute grave non liée à la grossesse ou d\'impossibilité de maintenir le contrat. La protection s\'étend 4 semaines après le congé maternité.',
          type: 'mise-en-situation'
        }
      ]
    },
    {
      id: 'droits-serie-2',
      title: 'QCM Droits et devoirs - Série n°2',
      description: '11 questions supplémentaires sur les droits et devoirs avec mises en situation.',
      questions: [
        {
          id: 'd2-1',
          text: 'La liberté d\'expression en France :',
          options: [
            'Est absolue et sans limites',
            'Est garantie mais limitée par la loi (diffamation, incitation à la haine, etc.)',
            'N\'existe pas dans la Constitution',
            'Est réservée aux journalistes'
          ],
          correctAnswer: 1,
          explanation: 'La liberté d\'expression est garantie par l\'article 11 de la DDHC de 1789, mais elle a des limites fixées par la loi : interdiction de la diffamation, de l\'injure, de l\'incitation à la haine raciale, de l\'apologie du terrorisme, et de la négation de crimes contre l\'humanité.',
          type: 'connaissance'
        },
        {
          id: 'd2-2',
          text: 'Le droit de vote en France est :',
          options: [
            'Réservé aux propriétaires',
            'Universel, égal, secret, pour tous les citoyens majeurs',
            'Conditionné par un niveau d\'études',
            'Ouvert uniquement aux personnes nées en France'
          ],
          correctAnswer: 1,
          explanation: 'Le suffrage est universel, égal et secret. Tout citoyen français âgé de 18 ans jouissant de ses droits civils et politiques peut voter. Ce principe a été progressivement étendu : aux non-catholiques (1789), aux juifs (1791), aux femmes (1944), et l\'âge abaissé de 21 à 18 ans (1974).',
          type: 'connaissance'
        },
        {
          id: 'd2-3',
          text: 'Mise en situation : Lucas, 17 ans, veut signer un contrat de travail. Que prévoit la loi ?',
          options: [
            'Il peut signer librement comme un adulte',
            'Il peut travailler à partir de 16 ans avec l\'autorisation de ses parents, ou à 14 ans pour des travaux légers pendant les vacances',
            'Il ne peut pas travailler avant 18 ans',
            'Il peut travailler seulement dans l\'entreprise familiale'
          ],
          correctAnswer: 1,
          explanation: 'En France, le travail est possible à partir de 16 ans avec l\'autorisation parentale. Des dérogations existent pour les travaux légers dès 14 ans pendant les vacances scolaires. L\'apprentissage est possible dès 16 ans (ou 15 ans si l\'adolescent a terminé le collège).',
          type: 'mise-en-situation'
        },
        {
          id: 'd2-4',
          text: 'L\'intérimaire a droit à :',
          options: [
            'Les mêmes droits que le salarié permanent uniquement en matière de salaire',
            'L\'égalité de traitement avec le salarié permanent pour les mêmes fonctions',
            'Aucune protection particulière',
            'Un salaire toujours supérieur de 50 %'
          ],
          correctAnswer: 1,
          explanation: 'Le principe d\'égalité de traitement entre intérimaires et salariés permanents est garanti par la loi. L\'intérimaire bénéficie de la même rémunération, des mêmes avantages et des mêmes conditions de travail, au prorata de son temps de travail.',
          type: 'connaissance'
        },
        {
          id: 'd2-5',
          text: 'Mise en situation : Leila découvre que son salaire est inférieur à celui de son collègue masculin pour le même poste. Que peut-elle faire ?',
          options: [
            'Rien, les salaires sont à la discrétion de l\'employeur',
            'Saisir le conseil de prud\'hommes car l\'égalité de rémunération entre hommes et femmes est obligatoire',
            'Seulement négocier avec son employeur',
            'Démissioner sans recours'
          ],
          correctAnswer: 1,
          explanation: 'La loi impose l\'égalité de rémunération entre les femmes et les hommes pour un même travail ou un travail de valeur égale (article L1142-1 du Code du travail). L\'employeur doit justifier toute différence de rémunération par des critères objectifs. Le salarié peut saisir le conseil de prud\'hommes.',
          type: 'mise-en-situation'
        },
        {
          id: 'd2-6',
          text: 'Le droit à la santé est garanti par :',
          options: [
            'Le Code de la santé publique uniquement',
            'Le préambule de la Constitution de 1946 et la loi',
            'La DDHC de 1789',
            'Le Code pénal'
          ],
          correctAnswer: 1,
          explanation: 'Le préambule de la Constitution de 1946 proclame que la nation garantit à tous la protection de la santé. Ce droit est concrétisé par la Sécurité sociale, la Protection universelle maladie (PUMA) et l\'aide médicale de l\'État pour les étrangers en situation irrégulière.',
          type: 'connaissance'
        },
        {
          id: 'd2-7',
          text: 'Mise en situation : Karim, sans papiers, a besoin de soins médicaux urgents. Que prévoit la loi ?',
          options: [
            'Il n\'a droit à aucun soin sans couverture sociale',
            'Il peut bénéficier de l\'aide médicale de l\'État (AME)',
            'Il doit payer la totalité des frais',
            'Il ne peut être soigné qu\'en cas de danger de mort immédiat'
          ],
          correctAnswer: 1,
          explanation: 'L\'aide médicale de l\'État (AME) permet aux étrangers en situation irrégulière résidant en France depuis plus de 3 mois d\'accéder aux soins médicaux. Elle couvre les soins urgents, les maladies chroniques et les hospitalisations. Ce dispositif repose sur le droit à la protection de la santé.',
          type: 'mise-en-situation'
        },
        {
          id: 'd2-8',
          text: 'L\'obligation scolaire en France concerne les enfants de :',
          options: [
            '6 à 16 ans',
            '3 à 16 ans',
            '6 à 18 ans',
            '3 à 18 ans'
          ],
          correctAnswer: 1,
          explanation: 'Depuis la loi du 26 juillet 2019, l\'instruction est obligatoire pour chaque enfant dès l\'âge de 3 ans et jusqu\'à l\'âge de 16 ans. L\'instruction peut être donnée dans les établissements d\'enseignement (publics ou privés) ou dans les familles.',
          type: 'connaissance'
        },
        {
          id: 'd2-9',
          text: 'Mise en situation : Nathalie subit des harcèlements de la part de son supérieur hiérarchique. Que peut-elle faire ?',
          options: [
            'Rien, c\'est une affaire privée',
            'Saisir le conseil de prud\'hommes et/ou porter plainte car le harcèlement moral est un délit pénal',
            'Uniquement démissioner',
            'Contacter uniquement les ressources humaines'
          ],
          correctAnswer: 1,
          explanation: 'Le harcèlement moral est un délit pénal (article 222-33-2 du Code pénal) et constitue un licenciement abusif si le salarié est contraint de démissionner. La victime peut porter plainte, saisir le conseil de prud\'hommes, alerter le CSE ou contacter l\'inspection du travail.',
          type: 'mise-en-situation'
        },
        {
          id: 'd2-10',
          text: 'La liberté de réunion est :',
          options: [
            'Interdite sans autorisation préalable',
            'Garantie par la Constitution, sous réserve de déclaration préalable pour les réunions sur la voie publique',
            'Réservée aux associations agréées',
            'Limitée aux meetings politiques'
          ],
          correctAnswer: 1,
          explanation: 'La liberté de réunion est garantie par l\'article 6 de la DDHC de 1789. Les réunions publiques doivent faire l\'objet d\'une déclaration préalable en mairie. Les autorités ne peuvent les interdire que pour des motifs d\'ordre public sérieux et avérés.',
          type: 'connaissance'
        },
        {
          id: 'd2-11',
          text: 'Mise en situation : Paul est témoin de discrimination raciale dans un magasin. Que peut-il faire ?',
          options: [
            'Rien, il n\'est pas directement victime',
            'Témoigner et alerter les autorités ; la discrimination raciale est punie par la loi',
            'Seulement avertir le gérant du magasin',
            'Poster un message sur les réseaux sociaux'
          ],
          correctAnswer: 1,
          explanation: 'La discrimination raciale est un délit pénal puni de 3 ans d\'emprisonnement et 45 000 euros d\'amende. Tout témoin peut signaler les faits aux autorités. Des associations anti-racistes agréées peuvent également se porter partie civile pour défendre les victimes.',
          type: 'mise-en-situation'
        }
      ]
    }
  ]
};

// ============================================================
// THÈME 3 : Histoire, géographie et culture (8 questions)
// ============================================================
const histoireGeographie: Theme = {
  id: 'histoire-geographie',
  slug: 'histoire-geographie-et-culture',
  title: 'Histoire, géographie et culture',
  shortTitle: 'Histoire, géographie et culture',
  icon: '🗺️',
  description: 'Les repères historiques, les territoires, le patrimoine et la culture française.',
  questionCount: 8,
  subThemes: ['Repères historiques', 'Territoires et géographie', 'Patrimoine français'],
  pointsVigilance: 'Mémorisation de personnages et dates clés',
  series: [
    {
      id: 'histoire-serie-1',
      title: 'QCM Histoire, géographie et culture - Série n°1',
      description: '8 questions sur les repères historiques, la géographie et la culture française.',
      questions: [
        {
          id: 'h1-1',
          text: 'En quelle année la Révolution française a-t-elle commencé ?',
          options: ['1776', '1789', '1804', '1815'],
          correctAnswer: 1,
          explanation: 'La Révolution française commence en 1789 avec la prise de la Bastille le 14 juillet. Elle met fin à l\'Ancien Régime et à la monarchie absolue. Elle aboutit à la Déclaration des droits de l\'homme et du citoyen et à l\'établissement de la République.',
          type: 'connaissance'
        },
        {
          id: 'h1-2',
          text: 'Quel est le plus long fleuve de France ?',
          options: ['La Seine', 'Le Rhône', 'La Loire', 'La Garonne'],
          correctAnswer: 2,
          explanation: 'La Loire est le plus long fleuve de France avec 1 012 km. Elle prend sa source au Mont Gerbier-de-Jonc dans l\'Ardèche et se jette dans l\'océan Atlantique à Saint-Nazaire. La Loire est inscrite au patrimoine mondial de l\'UNESCO entre Sully-sur-Loire et Chalonnes.',
          type: 'connaissance'
        },
        {
          id: 'h1-3',
          text: 'Qui a été le premier président de la Ve République ?',
          options: ['Charles de Gaulle', 'Georges Pompidou', 'François Mitterrand', 'Vincent Auriol'],
          correctAnswer: 0,
          explanation: 'Charles de Gaulle a été le premier président de la Ve République, élu en 1958. Il a impulsé la nouvelle Constitution qui instaure un pouvoir exécutif fort. Il est resté en fonction jusqu\'à sa démission en avril 1969.',
          type: 'connaissance'
        },
        {
          id: 'h1-4',
          text: 'Laquelle de ces œuvres est un chef-d\'œuvre de la littérature française ?',
          options: ['Les Misérables de Victor Hugo', 'Don Quichotte de Cervantès', 'Hamlet de Shakespeare', 'La Divine Comédie de Dante'],
          correctAnswer: 0,
          explanation: 'Les Misérables, publié en 1862 par Victor Hugo, est l\'un des plus grands romans de la littérature française. Il décrit la condition des pauvres et des marginaux au XIXe siècle et défend les valeurs de justice et de fraternité.',
          type: 'connaissance'
        },
        {
          id: 'h1-5',
          text: 'Quel événement a marqué la Libération de la France en 1944 ?',
          options: [
            'Le débarquement en Normandie le 6 juin 1944',
            'La signature de l\'armistice le 11 novembre 1918',
            'La prise de la Bastille le 14 juillet 1789',
            'Le traité de Rome en 1957'
          ],
          correctAnswer: 0,
          explanation: 'Le débarquement allié en Normandie le 6 juin 1944 (opération Overlord) marque le début de la Libération de la France. Paris est libéré le 25 août 1944. Ces événements mettent fin à quatre ans d\'occupation allemande pendant la Seconde Guerre mondiale.',
          type: 'connaissance'
        },
        {
          id: 'h1-6',
          text: 'Combien de régions métropolitaines compte la France depuis 2016 ?',
          options: ['22', '13', '27', '18'],
          correctAnswer: 1,
          explanation: 'Depuis la réforme territoriale de 2016, la France métropolitaine compte 13 régions (contre 22 auparavant). La France compte également 5 régions d\'outre-mer, soit 18 régions au total. Les régions sont des collectivités territoriales dirigées par un conseil régional.',
          type: 'connaissance'
        },
        {
          id: 'h1-7',
          text: 'Quel monument est le symbole de Paris et de la France dans le monde ?',
          options: ['Le Mont-Saint-Michel', 'La Tour Eiffel', 'Le château de Versailles', 'Le Pont du Gard'],
          correctAnswer: 1,
          explanation: 'La Tour Eiffel, construite par Gustave Eiffel pour l\'Exposition universelle de 1889, est le monument payant le plus visité au monde. Haute de 330 mètres, elle est devenue le symbole universel de Paris et de la France.',
          type: 'connaissance'
        },
        {
          id: 'h1-8',
          text: 'La Seconde Guerre mondiale s\'est terminée en Europe en :',
          options: ['1943', '1944', '1945', '1946'],
          correctAnswer: 2,
          explanation: 'La Seconde Guerre mondiale s\'est terminée en Europe le 8 mai 1945, date de la capitulation de l\'Allemagne nazie. Le 8 mai est un jour férié commémoratif en France. La guerre s\'est achevée définitivement le 2 septembre 1945 avec la capitulation du Japon.',
          type: 'connaissance'
        }
      ]
    },
    {
      id: 'histoire-serie-2',
      title: 'QCM Histoire, géographie et culture - Série n°2',
      description: '8 questions supplémentaires sur l\'histoire, la géographie et la culture française.',
      questions: [
        {
          id: 'h2-1',
          text: 'Quel est le plus ancien monument de Paris ?',
          options: ['Notre-Dame de Paris', 'La Tour Eiffel', 'Les arènes de Lutèce', 'Le Louvre'],
          correctAnswer: 2,
          explanation: 'Les arènes de Lutèce, construites au Ier siècle de notre ère, sont le plus ancien monument de Paris encore visible. Cet amphithéâtre romain pouvait accueillir environ 15 000 spectateurs pour des combats de gladiateurs.',
          type: 'connaissance'
        },
        {
          id: 'h2-2',
          text: 'Laquelle de ces personnalités est une figure de la Résistance française ?',
          options: ['Jean Moulin', 'Philippe Pétain', 'Napoléon Bonaparte', 'Louis XIV'],
          correctAnswer: 0,
          explanation: 'Jean Moulin est la figure emblématique de la Résistance française. Préfet démis de ses fonctions par Vichy, il a unifié les mouvements de résistance sous l\'autorité du général de Gaulle. Arrêté et torturé par la Gestapo, il est mort en déportation en 1943.',
          type: 'connaissance'
        },
        {
          id: 'h2-3',
          text: 'Quelle mer borde la côte méditerranéenne de la France ?',
          options: ['La mer du Nord', 'La mer Méditerranée', 'La mer Baltique', 'La mer Noire'],
          correctAnswer: 1,
          explanation: 'La mer Méditerranée borde la côte sud de la France, du Pyrénées-Orientales aux Alpes-Maritimes. La France possède environ 1 700 km de côtes méditerranéennes, incluant la Côte d\'Azur et le littoral languedocien.',
          type: 'connaissance'
        },
        {
          id: 'h2-4',
          text: 'Quel chef-d\'œuvre est exposé au musée du Louvre ?',
          options: ['La Joconde de Léonard de Vinci', 'Le Radeau de la Méduse de Géricault', 'Les Noces de Cana de Véronèse', 'Toutes ces réponses'],
          correctAnswer: 3,
          explanation: 'Le musée du Louvre abrite tous ces chefs-d\'œuvre. La Joconde est l\'œuvre la plus célèbre du musée. Le Radeau de la Méduse et Les Noces de Cana sont également exposés au Louvre, qui possède la plus grande collection d\'art au monde avec plus de 380 000 œuvres.',
          type: 'connaissance'
        },
        {
          id: 'h2-5',
          text: 'Quel traité a institué la Communauté économique européenne (CEE), ancêtre de l\'UE ?',
          options: ['Le traité de Paris (1951)', 'Le traité de Rome (1957)', 'Le traité de Maastricht (1992)', 'Le traité de Lisbonne (2007)'],
          correctAnswer: 1,
          explanation: 'Le traité de Rome, signé le 25 mars 1957 par la France, la RFA, l\'Italie et les trois pays du Benelux, a institué la Communauté économique européenne (CEE). Ce traité fondateur a posé les bases du marché commun et de la libre circulation.',
          type: 'connaissance'
        },
        {
          id: 'h2-6',
          text: 'Laquelle de ces montagnes est le plus haut sommet de France ?',
          options: ['Le Mont Cervin', 'Le Mont Blanc', 'Le Puy de Dôme', 'Le Canigou'],
          correctAnswer: 1,
          explanation: 'Le Mont Blanc, culminant à 4 808 mètres, est le plus haut sommet de France et d\'Europe occidentale. Situé dans les Alpes, à la frontière franco-italienne, il est un symbole de l\'alpinisme et du patrimoine naturel français.',
          type: 'connaissance'
        },
        {
          id: 'h2-7',
          text: 'Quel événement historique a eu lieu le 11 novembre 1918 ?',
          options: [
            'La signature du traité de Versailles',
            'L\'armistice mettant fin à la Première Guerre mondiale',
            'Le début de la Seconde Guerre mondiale',
            'La création de l\'ONU'
          ],
          correctAnswer: 1,
          explanation: 'Le 11 novembre 1918 marque la signature de l\'armistice entre les Alliés et l\'Allemagne, mettant fin à la Première Guerre mondiale. Cette date est commémorée chaque année en France et en Europe comme jour du Souvenir et fête de la Victoire.',
          type: 'connaissance'
        },
        {
          id: 'h2-8',
          text: 'Quel patrimoine gastronomique français est inscrit au patrimoine culturel immatériel de l\'UNESCO ?',
          options: [
            'Le fromage français uniquement',
            'Le repas gastronomique à la française',
            'La baguette de pain uniquement',
            'Le vin français uniquement'
          ],
          correctAnswer: 1,
          explanation: 'Le repas gastronomique à la française a été inscrit au patrimoine culturel immatériel de l\'UNESCO en 2010. Il désigne une pratique sociale coutumière qui met en valeur la cuisine française, ses produits, sa diversité et l\'art de la table. La baguette a été inscrite séparément en 2022.',
          type: 'connaissance'
        }
      ]
    }
  ]
};

// ============================================================
// THÈME 4 : Système institutionnel et politique (6 questions)
// ============================================================
const systemeInstitutionnel: Theme = {
  id: 'systeme-institutionnel',
  slug: 'systeme-institutionnel-et-politique',
  title: 'Système institutionnel et politique',
  shortTitle: 'Système institutionnel',
  icon: '🏰',
  description: 'La démocratie, la Constitution, les institutions françaises et européennes.',
  questionCount: 6,
  subThemes: ['Démocratie et Constitution', 'Institutions de la République', 'Institutions européennes'],
  pointsVigilance: '1 seule question sur l\'UE — à ne pas négliger',
  series: [
    {
      id: 'systeme-serie-1',
      title: 'QCM Système institutionnel et politique - Série n°1',
      description: '6 questions sur les institutions de la République et l\'Union européenne.',
      questions: [
        {
          id: 's1-1',
          text: 'Qui est le chef de l\'État en France ?',
          options: [
            'Le Premier ministre',
            'Le Président de la République',
            'Le Président de l\'Assemblée nationale',
            'Le Président du Sénat'
          ],
          correctAnswer: 1,
          explanation: 'Le Président de la République est le chef de l\'État, élu au suffrage universel direct pour un mandat de 5 ans (quinquennat depuis 2000). Il est le garant de la Constitution, de l\'indépendance nationale et de l\'intégrité du territoire.',
          type: 'connaissance'
        },
        {
          id: 's1-2',
          text: 'Quel est le rôle de l\'Assemblée nationale ?',
          options: [
            'Gouverner le pays au quotidien',
            'Représenter les citoyens, voter les lois et contrôler le gouvernement',
            'Nommer les ministres',
            'Déclarer la guerre'
          ],
          correctAnswer: 1,
          explanation: 'L\'Assemblée nationale est la chambre basse du Parlement français. Ses 577 députés, élus au suffrage universel direct, représentent les citoyens. Ils votent les lois, contrôlent l\'action du gouvernement et peuvent renverser le gouvernement par une motion de censure.',
          type: 'connaissance'
        },
        {
          id: 's1-3',
          text: 'La Constitution de la Ve République date de :',
          options: ['1946', '1958', '1962', '1789'],
          correctAnswer: 1,
          explanation: 'La Constitution de la Ve République a été adoptée par référendum le 28 septembre 1958 et promulguée le 4 octobre 1958. Elle a été révisée 24 fois. Elle instaure un régime semi-présidentiel avec un pouvoir exécutif renforcé.',
          type: 'connaissance'
        },
        {
          id: 's1-4',
          text: 'Le Conseil constitutionnel a pour rôle de :',
          options: [
            'Gouverner le pays',
            'Vérifier la conformité des lois à la Constitution',
            'Organiser les élections',
            'Nommer les ministres'
          ],
          correctAnswer: 1,
          explanation: 'Le Conseil constitutionnel est la juridiction chargée de veiller à la conformité des lois à la Constitution. Il peut être saisi avant la promulgation d\'une loi. Depuis 2010, toute personne peut invoquer l\'exception d\'inconstitutionnalité devant les tribunaux.',
          type: 'connaissance'
        },
        {
          id: 's1-5',
          text: 'Quel est le siège du Parlement européen ?',
          options: [
            'Paris',
            'Bruxelles uniquement',
            'Strasbourg (siège officiel) et Bruxelles (siège complémentaire)',
            'Francfort'
          ],
          correctAnswer: 2,
          explanation: 'Le siège officiel du Parlement européen est à Strasbourg, où se tiennent les 12 sessions plénières annuelles. Bruxelles accueille les sessions supplémentaires et les commissions. Ce dualisme est inscrit dans les traités et fait l\'objet de débats réguliers.',
          type: 'connaissance'
        },
        {
          id: 's1-6',
          text: 'Le Premier ministre est :',
          options: [
            'Élu au suffrage universel direct',
            'Nomme par le Président de la République',
            'Choisi par l\'Assemblée nationale',
            'Élu par les sénateurs'
          ],
          correctAnswer: 1,
          explanation: 'Le Premier ministre est nommé par le Président de la République (article 8 de la Constitution). Il dirige le gouvernement et est responsable devant le Parlement. En cas de cohabitation, le Premier ministre est généralement issu de la majorité parlementaire.',
          type: 'connaissance'
        }
      ]
    },
    {
      id: 'systeme-serie-2',
      title: 'QCM Système institutionnel et politique - Série n°2',
      description: '6 questions supplémentaires sur les institutions françaises et européennes.',
      questions: [
        {
          id: 's2-1',
          text: 'Combien de députés siègent à l\'Assemblée nationale ?',
          options: ['343', '577', '348', '750'],
          correctAnswer: 1,
          explanation: 'L\'Assemblée nationale compte 577 députés, élus au suffrage universel direct au scrutin majoritaire à deux tours. Chaque député représente une circonscription législative. Ce nombre a été réduit à 577 en 1986.',
          type: 'connaissance'
        },
        {
          id: 's2-2',
          text: 'Le Sénat est :',
          options: [
            'Élu au suffrage universel direct',
            'Élu par les grands électeurs (élus locaux)',
            'Nomme par le Président de la République',
            'Composé de membres héréditaires'
          ],
          correctAnswer: 1,
          explanation: 'Le Sénat est élu au suffrage universel indirect par environ 162 000 grands électeurs (députés, conseillers régionaux, conseillers départementaux, délégués municipaux). Il représente les collectivités territoriales et assure la représentation des territoires.',
          type: 'connaissance'
        },
        {
          id: 's2-3',
          text: 'Le droit de veto du Président de la République s\'applique :',
          options: [
            'À toutes les lois sans exception',
            'Aux lois avant leur promulgation (il peut demander une nouvelle délibération)',
            'Uniquement aux lois constitutionnelles',
            'À aucune loi'
          ],
          correctAnswer: 1,
          explanation: 'Le Président de la République peut, avant la promulgation d\'une loi, demander au Parlement une nouvelle délibération (article 10 de la Constitution). Ce n\'est pas un veto absolu mais un droit de renvoi. Le Parlement peut réadopter le texte à la majorité.',
          type: 'connaissance'
        },
        {
          id: 's2-4',
          text: 'La France est membre de l\'Union européenne depuis :',
          options: ['1951', '1957', '1973', '1992'],
          correctAnswer: 1,
          explanation: 'La France est membre fondatrice de la Communauté économique européenne (CEE) créée par le traité de Rome en 1957. Elle est l\'un des six pays fondateurs avec la RFA, l\'Italie, la Belgique, les Pays-Bas et le Luxembourg.',
          type: 'connaissance'
        },
        {
          id: 's2-5',
          text: 'Qui peut dissoudre l\'Assemblée nationale ?',
          options: [
            'Le Premier ministre',
            'Le Président de la République',
            'Le Conseil constitutionnel',
            'Le Président du Sénat'
          ],
          correctAnswer: 1,
          explanation: 'Le Président de la République peut dissoudre l\'Assemblée nationale (article 12 de la Constitution). Cette décision ne nécessite pas de contreseing. De nouvelles élections ont lieu dans les 20 à 40 jours suivant la dissolution.',
          type: 'connaissance'
        },
        {
          id: 's2-6',
          text: 'Les députés européens sont élus au :',
          options: [
            'Suffrage universel direct',
            'Suffrage universel indirect',
            'Nomination par les gouvernements',
            'Scrutin majoritaire uninominal'
          ],
          correctAnswer: 0,
          explanation: 'Les députés européens sont élus au suffrage universel direct depuis 1979. En France, l\'élection se déroule au scrutin proportionnel de liste. Le Parlement européen compte 720 députés représentant les citoyens de l\'Union européenne.',
          type: 'connaissance'
        }
      ]
    }
  ]
};

// ============================================================
// THÈME 5 : Vivre dans la société française (4 questions)
// ============================================================
const vivreSociete: Theme = {
  id: 'vivre-societe',
  slug: 'vivre-dans-la-societe-francaise',
  title: 'Vivre dans la société française',
  shortTitle: 'Vivre en société',
  icon: '🏠',
  description: 'Le logement, la santé, le travail et l\'éducation dans la société française.',
  questionCount: 4,
  subThemes: ['Logement', 'Santé', 'Travail', 'Éducation'],
  pointsVigilance: 'Moins de questions mais souvent des pièges de mise en situation',
  series: [
    {
      id: 'vivre-serie-1',
      title: 'QCM Vivre dans la société française - Série n°1',
      description: '4 questions sur la vie quotidienne en France.',
      questions: [
        {
          id: 'v1-1',
          text: 'En France, la sécurité sociale a été créée en :',
          options: ['1789', '1945', '1958', '1982'],
          correctAnswer: 1,
          explanation: 'La Sécurité sociale a été créée par l\'ordonnance du 4 octobre 1945. Elle repose sur le principe de solidarité nationale et garantit la protection sociale de tous : maladie, maternité, invalidité, vieillesse et accidents du travail.',
          type: 'connaissance'
        },
        {
          id: 'v1-2',
          text: 'Quel est le document obligatoire pour séjourner en France pour un étranger non européen ?',
          options: [
            'Un visa touristique suffit',
            'Un titre de séjour',
            'Un passeport uniquement',
            'Aucun document n\'est nécessaire'
          ],
          correctAnswer: 1,
          explanation: 'Tout étranger non ressortissant de l\'EEE souhaitant séjourner en France plus de 3 mois doit être titulaire d\'un titre de séjour. Il en existe plusieurs types : carte de résident, carte de séjour temporaire, carte de séjour pluriannuelle, selon la situation.',
          type: 'connaissance'
        },
        {
          id: 'v1-3',
          text: 'Le SMIC est :',
          options: [
            'Le salaire moyen en France',
            'Le salaire minimum interprofessionnel de croissance, revalorisé chaque année',
            'Le revenu maximal autorisé',
            'Un impôt sur le revenu'
          ],
          correctAnswer: 1,
          explanation: 'Le SMIC (Salaire minimum interprofessionnel de croissance) est le salaire horaire minimum légal en France. Il est revalorisé au moins une fois par an, au 1er janvier. Tout employeur doit verser un salaire au moins égal au SMIC à ses salariés.',
          type: 'connaissance'
        },
        {
          id: 'v1-4',
          text: 'L\'assurance chômage en France est financée par :',
          options: [
            'Uniquement par l\'État',
            'Les cotisations des employeurs et des salariés',
            'Uniquement par les salariés',
            'Les impôts sur le revenu'
          ],
          correctAnswer: 1,
          explanation: 'L\'assurance chômage est financée par les cotisations sociales des employeurs et des salariés, gérées par France Travail (anciennement Pôle emploi). L\'État participe également au financement de certaines mesures spécifiques comme les formations professionnelles.',
          type: 'connaissance'
        }
      ]
    },
    {
      id: 'vivre-serie-2',
      title: 'QCM Vivre dans la société française - Série n°2',
      description: '4 questions supplémentaires sur la vie en société.',
      questions: [
        {
          id: 'v2-1',
          text: 'En France, le service public de l\'emploi est assuré par :',
          options: [
            'L\'INSEE',
            'France Travail (anciennement Pôle emploi)',
            'La CAF',
            'La Sécurité sociale'
          ],
          correctAnswer: 1,
          explanation: 'France Travail (nouveau nom de Pôle emploi depuis le 1er janvier 2024) assure le service public de l\'emploi. Il accompagne les demandeurs d\'emploi dans leur recherche, verse les allocations chômage et aide les entreprises dans leurs recrutements.',
          type: 'connaissance'
        },
        {
          id: 'v2-2',
          text: 'La CAF (Caisse d\'allocations familiales) verse :',
          options: [
            'Uniquement les allocations chômage',
            'Des prestations familiales, logement et solidarité',
            'Uniquement les retraites',
            'Les salaires des fonctionnaires'
          ],
          correctAnswer: 1,
          explanation: 'La CAF verse de nombreuses prestations : allocations familiales, prime d\'activité, RSA, aide au logement (APL), allocation de soutien familial, etc. Elle est un pilier de la politique familiale et sociale française.',
          type: 'connaissance'
        },
        {
          id: 'v2-3',
          text: 'En France, l\'école maternelle est :',
          options: [
            'Facultative et payante',
            'Obligatoire et gratuite dès 3 ans',
            'Réservée aux familles aisées',
            'Obligatoire uniquement à partir de 5 ans'
          ],
          correctAnswer: 1,
          explanation: 'Depuis la loi du 26 juillet 2019, l\'instruction est obligatoire dès 3 ans. L\'école maternelle est gratuite dans le public. Elle accueille les enfants de 3 à 6 ans et constitue le premier cycle de l\'enseignement obligatoire.',
          type: 'connaissance'
        },
        {
          id: 'v2-4',
          text: 'Le RSA (Revenu de solidarité active) est :',
          options: [
            'Un salaire versé par l\'employeur',
            'Une allocation destinée à assurer un revenu minimum aux personnes sans ressources',
            'Une bourse d\'études',
            'Un crédit bancaire'
          ],
          correctAnswer: 1,
          explanation: 'Le RSA garantit un revenu minimum aux personnes de 25 ans et plus (ou moins de 25 ans avec enfant à charge) sans ressources suffisantes. Son montant dépend de la composition du foyer. Il est versé par la CAF et conditionné à des démarches d\'insertion.',
          type: 'connaissance'
        }
      ]
    }
  ]
};

// ============================================================
// Export all themes
// ============================================================
export const allThemes: Theme[] = [
  principesValeurs,
  droitsDevoirs,
  histoireGeographie,
  systemeInstitutionnel,
  vivreSociete
];

// ============================================================
// Full exam (40 questions, 45 minutes)
// ============================================================
export function generateFullExam(): Question[] {
  const questions: Question[] = [];
  // Principes: 11 questions
  questions.push(...principesValeurs.series[0].questions.slice(0, 7));
  questions.push(...principesValeurs.series[1].questions.slice(0, 4));
  // Droits: 11 questions
  questions.push(...droitsDevoirs.series[0].questions.slice(0, 7));
  questions.push(...droitsDevoirs.series[1].questions.slice(0, 4));
  // Histoire: 8 questions
  questions.push(...histoireGeographie.series[0].questions);
  // Système: 6 questions
  questions.push(...systemeInstitutionnel.series[0].questions);
  // Vivre: 4 questions
  questions.push(...vivreSociete.series[0].questions);
  return questions;
}

export const EXAM_CONFIG = {
  totalQuestions: 40,
  timeLimit: 45 * 60, // 45 minutes in seconds
  passingScore: 32, // 80%
  passingPercent: 80
};

// ============================================================
// Cours data
// ============================================================
export interface CourseChapter {
  id: string;
  title: string;
  description: string;
  themes: string[];
  lessons: string[];
}

export const courses: CourseChapter[] = [
  {
    id: 'cours-principes',
    title: 'Principes et valeurs de la République',
    description: 'Découvrez la devise, les symboles, la laïcité et les valeurs fondamentales de la République française.',
    themes: ['Devise et symboles', 'Laïcité', 'Mises en situation'],
    lessons: ['Liberté, Égalité, Fraternité : sens et origines', 'Les symboles de la République', 'La loi de 1905 et la laïcité', 'Laïcité à l\'école et au travail', 'Valeurs républicaines en situations pratiques']
  },
  {
    id: 'cours-droits',
    title: 'Droits et devoirs',
    description: 'Apprenez vos droits fondamentaux et vos obligations en tant que citoyen ou résident en France.',
    themes: ['Droits fondamentaux', 'Obligations légales'],
    lessons: ['La DDHC de 1789', 'Les droits sociaux', 'L\'égalité homme-femme', 'Le droit du travail', 'Les obligations civiques']
  },
  {
    id: 'cours-histoire',
    title: 'Histoire, géographie et culture',
    description: 'Maîtrisez les repères historiques, la géographie de la France et le patrimoine culturel.',
    themes: ['Repères historiques', 'Territoires', 'Patrimoine'],
    lessons: ['La Révolution française', 'Les deux guerres mondiales', 'La Ve République', 'Géographie de la France', 'Patrimoine culturel français']
  },
  {
    id: 'cours-systeme',
    title: 'Système institutionnel et politique',
    description: 'Comprenez le fonctionnement des institutions françaises et européennes.',
    themes: ['Institutions nationales', 'Institutions européennes'],
    lessons: ['La Constitution de 1958', 'Le Président et le gouvernement', 'Le Parlement', 'La justice', 'L\'Union européenne']
  },
  {
    id: 'cours-vivre',
    title: 'Vivre dans la société française',
    description: 'Préparez-vous à la vie quotidienne en France : logement, santé, travail et éducation.',
    themes: ['Logement', 'Santé', 'Travail', 'Éducation'],
    lessons: ['La Sécurité sociale', 'Le système de santé', 'Le droit du logement', 'Le système éducatif', 'France Travail et l\'emploi']
  }
];

// ============================================================
// Ressources data
// ============================================================
export interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
}

export const resources: Resource[] = [
  { id: 'r1', title: 'Examen civique pour le renouvellement de titre de séjour', category: 'Comprendre l\'examen', description: 'Tout savoir sur l\'obligation de l\'examen civique pour le renouvellement du titre de séjour.' },
  { id: 'r2', title: 'Résultats de l\'examen civique : accès, délais et interprétation', category: 'Comprendre l\'examen', description: 'Comment consulter vos résultats et comprendre votre score.' },
  { id: 'r3', title: 'Comment s\'inscrire à l\'examen civique : procédure pas à pas', category: 'Préparer l\'examen', description: 'Guide complet pour s\'inscrire à l\'examen civique.' },
  { id: 'r4', title: 'Examen civique en outre-mer : spécificités selon les territoires', category: 'Comprendre l\'examen', description: 'Les particularités de l\'examen dans les territoires d\'outre-mer.' },
  { id: 'r5', title: 'Que faire en cas d\'échec à l\'examen civique ?', category: 'Préparer l\'examen', description: 'Procédure et recours après un échec à l\'examen.' },
  { id: 'r6', title: 'Documents à apporter le jour de l\'examen civique', category: 'Le jour de l\'examen', description: 'Liste complète des documents nécessaires le jour J.' },
  { id: 'r7', title: 'Programme officiel de l\'examen civique 2026', category: 'Préparer l\'examen', description: 'Le programme officiel et les thématiques à réviser.' },
  { id: 'r8', title: 'Arrêté du 10 octobre 2025 : texte réglementaire', category: 'Comprendre l\'examen', description: 'Le texte officiel définissant le programme et les modalités de l\'examen.' }
];
