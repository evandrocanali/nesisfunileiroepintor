import { useState, useMemo } from 'react';
import { User, Car, Wrench, Plus, Trash2, FileText, Camera, Image, X, Send } from 'lucide-react';
import { generateQuotePDF } from './utils/pdfGenerator';
import './index.css';

function App() {
  const [client, setClient] = useState({ name: '', phone: '', email: '' });
  const [vehicle, setVehicle] = useState({ model: '', plate: '', year: '', color: '' });
  const [items, setItems] = useState([{ id: 1, description: '', price: 0, quantity: 1 }]);
  const [photos, setPhotos] = useState([]);
  const [workshopLogo, setWorkshopLogo] = useState(null);

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [items]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', price: 0, quantity: 1 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, { id: Date.now() + Math.random(), src: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const handleGeneratePDF = () => {
    if (!client.name) {
      alert('Por favor, preencha o nome do cliente.');
      return;
    }
    console.log('Generating PDF for:', client.name);
    generateQuotePDF({ client, vehicle, items, total, photos, workshopLogo });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setWorkshopLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleWhatsAppShare = async () => {
    if (!client.name || !client.phone) {
      alert('Por favor, preencha o nome e o telefone do cliente.');
      return;
    }

    const message = `Olá ${client.name}, aqui está o orçamento para o veículo ${vehicle.model} (${vehicle.plate}). Total: R$ ${total.toFixed(2).replace('.', ',')}.`;
    const phone = client.phone.replace(/\D/g, '');

    // Try Web Share API (Mobile)
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await generateQuotePDF({ client, vehicle, items, total, photos, workshopLogo }, { save: false, returnBlob: true });
        const file = new File([blob], `orcamento-${vehicle.model}.pdf`, { type: 'application/pdf' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Orçamento NEsis',
            text: message,
            files: [file],
          });
          return;
        }
      } catch (e) {
        console.error('Error sharing:', e);
      }
    }

    // Fallback to wa.me
    const url = `https://wa.me/${phone.startsWith('55') ? phone : '55' + phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>NEsis do Funileiro e Pintor</h1>
          <p className="subtitle">Gerador de Orçamentos de Funilaria e Pintura</p>
        </div>
        <div className="logo-upload-wrapper">
          <label className={`logo-box ${workshopLogo ? 'has-logo' : ''}`}>
            <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
            {workshopLogo ? (
              <>
                <img src={workshopLogo} alt="Logo Oficina" />
                <button className="remove-logo" onClick={(e) => { e.preventDefault(); setWorkshopLogo(null); }}>
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <Image size={24} />
                <span>Sua Logotipo</span>
              </>
            )}
          </label>
        </div>
      </header>

      <section className="section">
        <h2 className="section-title"><User size={20} /> Dados do Cliente</h2>
        <div className="grid">
          <div className="input-group">
            <label>Nome Completo</label>
            <input 
              type="text" 
              placeholder="Ex: João Silva" 
              value={client.name}
              onChange={(e) => setClient({...client, name: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Telefone</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="(11) 99999-9999" 
                value={client.phone}
                onChange={(e) => setClient({...client, phone: e.target.value})}
              />
            </div>
          </div>
          <div className="input-group">
            <label>E-mail</label>
            <input 
              type="email" 
              placeholder="cliente@email.com" 
              value={client.email}
              onChange={(e) => setClient({...client, email: e.target.value})}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title"><Car size={20} /> Dados do Veículo</h2>
        <div className="grid">
          <div className="input-group">
            <label>Modelo / Marca</label>
            <input 
              type="text" 
              placeholder="Ex: Toyota Corolla" 
              value={vehicle.model}
              onChange={(e) => setVehicle({...vehicle, model: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Placa</label>
            <input 
              type="text" 
              placeholder="ABC-1234" 
              value={vehicle.plate}
              onChange={(e) => setVehicle({...vehicle, plate: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Ano</label>
            <input 
              type="text" 
              placeholder="2022" 
              value={vehicle.year}
              onChange={(e) => setVehicle({...vehicle, year: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Cor</label>
            <input 
              type="text" 
              placeholder="Prata" 
              value={vehicle.color}
              onChange={(e) => setVehicle({...vehicle, color: e.target.value})}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title"><Wrench size={20} /> Serviços e Peças</h2>
        <table className="items-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th style={{ width: '150px' }}>Preço Unt. (R$)</th>
              <th style={{ width: '80px' }}>Qtd</th>
              <th style={{ width: '150px' }}>Subtotal</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="item-row">
                <td>
                  <input 
                    className="w-full"
                    type="text" 
                    placeholder="Ex: Pintura Porta Dianteira" 
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </td>
                <td>
                  <div style={{ padding: '0 0.75rem', fontWeight: '600' }}>
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </div>
                </td>
                <td>
                  <button className="btn-danger" onClick={() => removeItem(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-secondary" onClick={addItem}>
          <Plus size={20} /> Adicionar Item
        </button>
      </section>

      <section className="section">
        <h2 className="section-title"><Camera size={20} /> Fotos da Peça / Serviço</h2>
        <div className="photo-upload-container">
          <label className="upload-box">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <Image size={32} />
            <span>Galeria</span>
          </label>
          <label className="upload-box">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <Camera size={32} />
            <span>Câmera</span>
          </label>
        </div>

        {photos.length > 0 && (
          <div className="photo-grid">
            {photos.map(photo => (
              <div key={photo.id} className="photo-card">
                <img src={photo.src} alt="Upload" />
                <button className="remove-photo" onClick={() => removePhoto(photo.id)}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="results">
        <div className="total-box">
          <div className="total-label">Total do Orçamento</div>
          <div className="total-amount">R$ {total.toFixed(2).replace('.', ',')}</div>
        </div>
        <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={handleGeneratePDF}>
          <FileText size={22} /> Gerar PDF do Orçamento
        </button>
        <button className="btn btn-whatsapp" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={handleWhatsAppShare}>
          <Send size={22} /> Enviar via WhatsApp
        </button>
      </div>
    </div>
  );
}

export default App;
