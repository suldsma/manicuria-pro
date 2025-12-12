import ServiceCard from './UI/ServiceCard';
import BenefitItem from './UI/BenefitItem';

function Inicio({ navigate }) {
  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-gradient-to-r from-pink-100 to-pink-50 rounded-3xl shadow-lg">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
          Bienvenida a Manicure Studio
        </h1>

        <button
          onClick={() => navigate('turnos')}
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:scale-105 transition-all"
        >
          Reservar Turno
        </button>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-6">Nuestros Servicios</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <ServiceCard
            title="Manicura Clásica"
            price="$3500"
            description="Limado, cutículas y esmaltado tradicional."
          />
          <ServiceCard
            title="Esmaltado Permanente"
            price="$5500"
            description="Duración 2-3 semanas."
          />
          <ServiceCard
            title="Uñas Esculpidas"
            price="$8000"
            description="Sistema de gel con diseños personalizados."
          />
        </div>
      </section>

      <section className="bg-white p-8 rounded-3xl shadow">
        <h2 className="text-3xl font-bold text-center mb-6">¿Por qué elegirnos?</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <BenefitItem icon="✨" text="Productos premium" />
          <BenefitItem icon="🎨" text="Diseños personalizados" />
          <BenefitItem icon="⏰" text="Turnos flexibles" />
          <BenefitItem icon="💅" text="Profesionales capacitadas" />
        </div>
      </section>
    </div>
  );
}

export default Inicio;
