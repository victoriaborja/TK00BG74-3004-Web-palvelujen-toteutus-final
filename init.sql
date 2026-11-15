CREATE TABLE animals (
  id           TEXT PRIMARY KEY,
  sort_order   INT  NOT NULL,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('Koira','Kissa')),
  age          TEXT NOT NULL,
  breed        TEXT NOT NULL,
  fur_color    TEXT NOT NULL,
  dark_color   TEXT NOT NULL,
  light_color  TEXT NOT NULL,
  bg_color     TEXT NOT NULL,
  ear_style    TEXT NOT NULL,
  description  TEXT NOT NULL,
  needs        TEXT[] NOT NULL DEFAULT '{}',
  status       TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','adopted')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE adoptions (
  id          SERIAL PRIMARY KEY,
  animal_id   TEXT NOT NULL UNIQUE REFERENCES animals(id),
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  message     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO animals (id, sort_order, name, type, age, breed, fur_color, dark_color, light_color, bg_color, ear_style, description, needs) VALUES
('milo',1,'Milo','Koira','3 vuotta','Suomenlapinkoira','#C98B4E','#8E5A2C','#F0DDC0','#C9D6BE','p','Milo on utelias ja ulkoilmaihminen, joka rakastaa metsäpolkuja. Kotona hän on rauhallinen ja hakeutuu aina lähelle ihmistä.',ARRAY['Pitkät päivittäiset lenkit','Sopii aktiiviseen perheeseen','Viihtyy kodin muiden koirien kanssa']),
('aava',2,'Aava','Koira','2 vuotta','Sekarotuinen','#E9E0D0','#A89677','#FFFFFF','#E6C9B6','f','Aava on lempeä ja leikkisä nuori neiti. Hän oppii nopeasti ja nauttii yhteisistä harjoituksista.',ARRAY['Peruskoulutus jatkuu','Ei sovi kissakotiin','Tarvitsee kärsivällisen ohjaajan']),
('remu',3,'Remu','Koira','5 vuotta','Labradorinnoutaja','#D9B26A','#A7803A','#F3E3BE','#B9CBB3','f','Remu on kiltti ja sosiaalinen veijari. Hän tervehtii kaikkia hännänheilutuksella ja rakastaa uimista.',ARRAY['Sopii lapsiperheeseen','Ruokavalion seuranta','Mielellään oma piha']),
('pippuri',4,'Pippuri','Koira','1 vuotta','Parsonrussellinterrieri','#F4EEE4','#7A4A2B','#FFFFFF','#DCC3B0','f','Pippuri on pieni energiapommi, joka haluaa olla mukana kaikessa. Hän tarvitsee tekemistä ja selkeät rajat.',ARRAY['Paljon aktivointia','Aitaus piha tai pihaa lähellä','Kokemusta terriereistä']),
('tuuli',5,'Tuuli','Koira','4 vuotta','Suomenpystykorva','#B5703A','#7C451F','#EBCFA8','#C4D2C0','p','Tuuli on reipas ja äänekäs persoona. Kun luottamus on syntynyt, hän on uskollisin ystävä.',ARRAY['Haukkuherkkä, sopii omakotitaloon','Säännölliset lenkit','Hidas tutustuminen']),
('mosse',6,'Mosse','Kissa','4 vuotta','Maatiaiskissa','#6E6F73','#45464A','#E4E4E4','#E3C7B1','p','Mosse on rauhallinen sylikissa, joka kehrää heti kun hänet nostaa syliin. Hän pitää ikkunapaikasta ja aamuruoasta.',ARRAY['Sisäkissa','Sopii yksin tai kaksin','Rauhallinen koti']),
('nelli',7,'Nelli','Kissa','2 vuotta','Norjanmetsänkissa','#A8794A','#5F4023','#F0E3CF','#BFD0BA','p','Nelli on seurallinen ja puheliaa sorttia. Hän seuraa ihmistä huoneesta toiseen ja kiipeilee mielellään korkealle.',ARRAY['Kiipeilypuu tai hyllyjä','Turkin harjausta viikoittain','Leikkiseuraa']),
('vilmer',8,'Vilmer','Kissa','7 vuotta','Maatiaiskissa','#E0A25E','#B5702C','#FBE9CF','#CBD5BC','p','Vilmer on viisas herrasmies, joka nauttii tasaisesta arjesta. Hän on varma valinta ensimmäiseksi kissaksi.',ARRAY['Seniorin ruokavalio','Hellä ja kärsivällinen koti','Sopii kerrostaloon']),
('luna',9,'Luna','Kissa','3 vuotta','Siamilainen','#E8D9BF','#4B3B33','#F7EEDC','#E7CDBB','p','Luna on tunteikas ja älykäs. Hän haluaa olla seurassa eikä pidä pitkistä yksinoloajoista.',ARRAY['Ei pitkiä yksinoloja','Älypelejä ja leikkiä','Mielellään kissaystävä']),
('porri',10,'Pörri','Kissa','1 vuotta','Pitkäkarvainen maatiaiskissa','#F1ECE4','#B9A68C','#FFFFFF','#B8CAB4','p','Pörri on pehmeä pallero, jonka mielestä kaikki ovat ystäviä. Hän tutustuu uuteen kotiin uteliaana.',ARRAY['Turkin hoito joka päivä','Sopii lapsiperheeseen','Sisäkissa']);
