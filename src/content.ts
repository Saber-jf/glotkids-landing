/**
 * What the app holds, as the site tells it, in both languages. Every line is
 * true of the app as built (loplop: categories/*.json, the roadmap) -- update
 * it with the app, never ahead of it. Store reviewers compare it with the app.
 */
import type { L } from "./site";

export interface World {
  id: string;
  name: L;
  c: string;
  soft: string;
  text: L;
  /** its three games: introduce, practise, quietly use */
  games: [L, L, L];
  words: string[];
  shots: [string, string];
}

const l = (en: string, tr: string): L => ({ en, tr });

export const WORLDS: World[] = [
  {
    id: "mutfak", name: l("Kitchen", "Mutfak"), c: "#ff8a5b", soft: "#ffe2d3",
    text: l("Lili is hungry! The teacher names a food and the child hands it to Lili. Then a basket is filled and a picnic is laid.",
            "Lili acıkmış! Elif Öğretmen bir yiyeceğin adını söyler, çocuk onu Lili'ye verir. Sonra sepet dolar, piknik kurulur."),
    games: [l("Give it to Lili", "Lili'ye ver"), l("Find it", "Bul bakalım"), l("Picnic", "Piknik")],
    words: ["banana", "apple", "bread", "milk", "water", "cheese", "egg"],
    shots: ["/img/film/film-3.jpg", "/img/film/film-9.jpg"],
  },
  {
    id: "hayvanlar", name: l("Animal Friends", "Hayvan Dostlarımız"), c: "#4cb5e8", soft: "#d8f1ff",
    text: l("The animals board a train, play hide-and-seek in the woods and pose for photos at the beach. Each animal calls in its own voice.",
            "Hayvanlar trene biner, ormanda saklambaç oynanır, sahilde hatıra fotoğrafı çekilir. Her hayvan kendi sesiyle seslenir."),
    games: [l("Train", "Tren"), l("Hide-and-seek", "Saklambaç"), l("Photo trip", "Fotoğraf gezisi")],
    words: ["dog", "cat", "rabbit", "monkey", "tiger", "frog"],
    shots: ["/img/games/animals-train.jpg", "/img/games/animals-photo.jpg"],
  },
  {
    id: "giysiler", name: l("Clothes", "Giysiler"), c: "#a78bfa", soft: "#ece5ff",
    text: l("Muddy clothes go into the washing machine, clean ones into a suitcase, and at the end the right piece is found by its sound.",
            "Çamurlu giysiler makineye atılır, temizler bavula yerleşir, sonunda sesli etiketler dinlenip doğru giysi bulunur."),
    games: [l("Laundry", "Çamaşır"), l("Suitcase", "Bavul"), l("Sound labels", "Sesli etiket")],
    words: ["hat", "shoes", "socks", "pants", "T-shirt", "coat"],
    shots: ["/img/games/clothes-laundry.jpg", "/img/games/clothes-label.jpg"],
  },
  {
    id: "renkler", name: l("Colours", "Renkler"), c: "#f2547d", soft: "#ffdde6",
    text: l("A house and a bunch of flowers are painted, coloured balls bounce, and in Kuki's workshop the thing of the right colour goes into the parcel.",
            "Bir ev ve anneye bir çiçek demeti boyanır, renkli toplar seker, Kuki'nin atölyesinde doğru renkteki şey pakete konur."),
    games: [l("Painting", "Boyama"), l("Coloured balls", "Renkli toplar"), l("Colour workshop", "Renk atölyesi")],
    words: ["red", "blue", "yellow", "green", "orange", "pink"],
    shots: ["/img/film/film-35.jpg", "/img/games/colours-playroom.jpg"],
  },
  {
    id: "sayilar", name: l("How Many?", "Kaç Tane?"), c: "#ffb300", soft: "#fff0c2",
    text: l("Apples are counted together, the basket gets just as many as asked, and the dog and the cat get the right amount on their plates.",
            "Elmalar birlikte sayılır, sepete istenen kadar konur, köpeğe ve kediye tabaklarında söylenen kadar yiyecek verilir."),
    games: [l("Let's count", "Birlikte sayalım"), l("Just as many", "İstediğim kadar koy"), l("Which group?", "Hangi grup?")],
    words: ["one", "two", "three", "four", "five"],
    shots: ["/img/games/numbers-count.jpg", "/img/games/numbers-group.jpg"],
  },
  {
    id: "hareketler", name: l("Actions", "Hareketler"), c: "#3fb45a", soft: "#d6f5d9",
    text: l("In the park Kuki jumps, runs and waves; at the puppet theatre the right puppet is found; at the end the child directs the stage.",
            "Kuki parkta zıplar, koşar, el sallar; kukla tiyatrosunda doğru kukla bulunur, sonunda sahneyi çocuk yönetir."),
    games: [l("Action park", "Hareket parkı"), l("Puppets", "Hareketli kuklalar"), l("Direct the stage", "Sahneyi yönet")],
    words: ["jump", "run", "sit", "wave", "clap", "dance"],
    shots: ["/img/film/film-61.jpg", "/img/games/actions-puppets.jpg"],
  },
];

export const WORD_COUNT = WORLDS.reduce((n, w) => n + w.words.length, 0);
export const GAME_COUNT = WORLDS.length * 3;

/** what parents ask; every answer matches the app at release (src/site.ts → APP) */
export const FAQ: { q: L; a: L }[] = [
  { q: l("My child can't read yet. Can they play?", "Çocuğum henüz okuma bilmiyor. Oynayabilir mi?"),
    a: l("Yes, the app is made for children who can't read yet. Instructions are spoken (in Turkish); there are no sentences to read. Cards show a picture and the English word.",
         "Evet, uygulama okuma bilmeyen çocuklar için yapıldı. Yönergeler sesle söylenir; ekranda okunacak cümle yoktur. Kartlarda resim ve İngilizce kelime durur.") },
  { q: l("Which language does the app speak?", "Uygulama hangi dili konuşuyor?"),
    a: l("The app is for Turkish-speaking children: instructions are in Turkish, and the words being learned are English.",
         "Uygulama Türkçe konuşan çocuklar içindir: yönergeler Türkçe, öğrenilen kelimeler İngilizcedir.") },
  { q: l("What age is it for?", "Hangi yaş için?"),
    a: l("Ages 4–8. Younger children get demonstrations and step-by-step help; older children play more on their own.",
         "4–8 yaş. Küçükler gösterimler ve adım adım yardımla, büyükler daha bağımsız oynar.") },
  { q: l("Are there ads or in-app purchases?", "Reklam ya da uygulama içi satın alma var mı?"),
    a: l("There are no ads. Pricing has not been announced yet; it will be shown here and in the store. Anything a parent pays for would be behind the parental gate, never in front of the child.",
         "Reklam yok. Fiyatlandırma henüz açıklanmadı; açıklanınca burada ve mağazada yazacak. Ücretli bir şey olursa ebeveyn kapısının arkasında olur, çocuğun önüne çıkmaz.") },
  { q: l("Do I need an account?", "Hesap açmak zorunlu mu?"),
    a: l("No. Without an account, your child's progress stays on the device. A parent account is optional: it keeps a copy of the progress on our server, so you can continue on another device.",
         "Hayır. Hesap yoksa çocuğun ilerlemesi cihazda kalır. Ebeveyn hesabı isteğe bağlıdır: ilerlemenin bir kopyasını sunucumuzda tutar, böylece başka bir cihazda devam edebilirsiniz.") },
  { q: l("Does it need the internet?", "İnternet gerekiyor mu?"),
    a: l("The first worlds come with the app. Later worlds are downloaded as your child moves on, and app updates also come over the internet. The app is not designed to be used fully offline.",
         "İlk dünyalar uygulamayla gelir. Sonraki dünyalar çocuk ilerledikçe internetten iner; uygulama güncellemeleri de internetle gelir. Uygulama tamamen internetsiz kullanılmak üzere tasarlanmadı.") },
  { q: l("Does the app use the microphone, camera or location?", "Mikrofon, kamera ya da konum kullanıyor mu?"),
    a: l("No. It asks for none of these permissions. The camera in the photo game is a toy camera drawn in the game.",
         "Hayır, bu izinleri istemez. Fotoğraf oyunundaki kamera oyunun içinde çizilmiş bir oyuncak kameradır.") },
  { q: l("What happens if the sound is too low?", "Ses kısıkken ne olur?"),
    a: l("Every question is spoken, so if the device volume is very low the game waits and shows, with a picture, how to turn it up. A small button lets a grown-up continue without sound.",
         "Her soru sesle sorulduğu için cihazın sesi çok kısıksa oyun bekler ve sesin açılmasını resimle ister. Küçük bir düğmeyle bir yetişkin sessiz devam edebilir.") },
  { q: l("What if my child can't find a word?", "Çocuğum bir kelimeyi bulamazsa ne olur?"),
    a: l("Nobody says 'wrong' and there are no points. The word is said again, then once more, then the right thing gently grows and shrinks. A wrong choice is named too, and the question is asked again.",
         "Kimse 'yanlış' demez, puan yoktur. Kelime yeniden söylenir, sonra bir daha, sonra doğru şey hafifçe büyüyüp küçülür. Yanlış seçilen şeyin de adı söylenir ve soru yinelenir.") },
  { q: l("How do I delete my account and data?", "Hesabımı ve verilerimi nasıl silerim?"),
    a: l("In the app: 'Ebeveyn' (Parent) → answer the grown-up question → 'Hesabı sil' (Delete account). You can also ask us by email. See 'Delete your account and data'.",
         "Uygulamada: 'Ebeveyn' → yetişkin sorusunu cevaplayın → 'Hesabı sil'. E-postayla da isteyebilirsiniz. Ayrıntı: 'Hesabı ve verileri silme'.") },
];
