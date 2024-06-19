import { useContext, useEffect, useState } from 'react';
import { ServiceCard } from './ServiceCard';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../utils/AuthContext';
import SyncLoader from 'react-spinners/SyncLoader';
import { DeleteModal } from './DeleteModal';
import Search from './Search';
import CreateButton from './CreateButton';
import { useNavigate } from 'react-router-dom';

const ServicesPageContainer = styled.div`
  padding: 4rem 0rem;
  max-width: 75rem;
  margin: 0 auto;
`;

const ServicesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1.25rem;
  margin-top: 1.25rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  max-width: 77.5rem;
  margin: 0 auto;
`;

const Info = styled.p`
  font-size: 1.25rem;
  word-break: break-word;
  user-select: none;
  padding: 2rem 2rem 2rem 0;
`;

export const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [deleteModalItemId, setDeleteModalItemId] = useState(null);
  const [serviceSchedule, setServiceSchedule] = useState({});
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:1000/api/beauty/services');
        setServices(response.data);
        setFilteredServices(response.data);
        setServicesLoading(false);

        // Užklausiame ir isetinam kiekvienos paslaugos schedule
        const schedules = await Promise.all(response.data.map((service) => fetchServiceSchedule(service.id)));
        const scheduleMap = {};
        response.data.forEach((service, index) => {
          scheduleMap[service.id] = schedules[index];
        });
        setServiceSchedule(scheduleMap);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    // Paslaugu filtravimo pagal pavadinimą ir datą funkcija
    const filterServices = () => {
      if (searchQuery.trim() === '') {
        setFilteredServices(services);
      } else {
        const filtered = services.filter((service) => {
          // Tikriname, ar paslaugos pavadinimas ir data atitinka paieškos užklausą
          return (
            (service.title && service.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (service.date_time && service.date_time.includes(searchQuery)) ||
            (service.schedule &&
              service.schedule.some((scheduleItem) => {
                return scheduleItem && scheduleItem.toString().toLowerCase().includes(searchQuery.toLowerCase());
              }))
          );
        });
        setFilteredServices(filtered);
      }
    };

    filterServices();
  }, [searchQuery, services, serviceSchedule]);

  const fetchServiceSchedule = async (serviceId) => {
    try {
      const response = await axios.get(`http://localhost:1000/api/beauty/services/${serviceId}/schedule`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching schedule for service ${serviceId}:`, error);
      return [];
    }
  };

  const deleteService = async (serviceId) => {
    try {
      await axios.delete(`http://localhost:1000/api/beauty/services/${serviceId}`);
      const updatedServices = services.filter((service) => service.id !== serviceId);
      setServices(updatedServices);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };


  return (
    <>
      <ServicesPageContainer>
        <ButtonsContainer>
          {user && user.role === 'admin' && (
            <CreateButton buttonTitle="Add service" onClick={() => navigate('/create')} />
          )}
          <Search onSearch={setSearchQuery} />
        </ButtonsContainer>
        <ServicesContainer>
          {servicesLoading ? (
            <LoadingContainer>
              <SyncLoader color={'#dddddd'} loading={servicesLoading} size={20} />
            </LoadingContainer>
          ) : filteredServices.length === 0 ? (
            <Info>No services available</Info>
          ) : (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id ? `service-${service.id}` : null}
                {...service}
                isVisible={user && user.role === 'admin'}
                onDeleteModalOpen={() => setDeleteModalItemId(service.id)}
                schedule={serviceSchedule[service.id] || []} // Perduodame paslaugos tvarkarasti
              />
            ))
          )}
        </ServicesContainer>
        {deleteModalItemId && (
          <DeleteModal
          serviceId={deleteModalItemId}
            onClose={() => setDeleteModalItemId(null)}
            onDelete={() => {
              deleteService(deleteModalItemId);
              setDeleteModalItemId(null);
            }}
          />
        )}
      </ServicesPageContainer>
    </>
  );
};
