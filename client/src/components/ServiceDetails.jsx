import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { AuthContext } from '../utils/AuthContext';
import format from 'date-fns/format';

const PageContainer = styled.div`
  padding: 7rem 3rem 2rem 3rem;
  max-width: 75rem;
  margin: 0 auto;
`;

const ServiceDetailsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
  max-width: 75rem;
  padding: 20px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
`;

const DetailItem = styled.div`
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;

  h2 {
    font-size: 0.85rem;
    color: #818181;
    margin-bottom: 0.5rem;
    font-weight: normal;
  }

  p {
    font-size: 1.1rem;
    margin: 0.5rem 0;
  }
`;

const Details = styled.div`
  flex: 1;
`;

const ImageContainer = styled.div`
  width: 40%;
  margin-right: 20px;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: 0.25rem;
`;

const Button = styled.button`
  background-color: #ffffff;
  color: #000;
  border: 1px solid #dddddd;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  transition:
    background-color 0.3s,
    color 0.3s,
    transform 0.3s;
  &:hover {
    background-color: #dddddd;
    transform: scale(1.05);
  }
`;

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useContext(AuthContext);
  const [serviceSchedule, setServiceSchedule] = useState([]);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await axios.get(`http://localhost:1000/api/beauty/services/${id}`);
        setService(response.data);
        setLoading(false);
        const schedule = await fetchServiceSchedule(response.data.id);
        setServiceSchedule(schedule);
      } catch (error) {
        console.error('Error loading the service:', error);
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const fetchServiceSchedule = async (serviceId) => {
    try {
      const response = await axios.get(`http://localhost:1000/api/beauty/services/${serviceId}/schedule`);
      return response.data;
    } catch (error) {
      console.error(`Error loading the service schedule ${serviceId}:`, error);
      return [];
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <PageContainer>
      <ServiceDetailsContainer>
        {service && (
          <>
            <Details>
              <DetailItem>
                <h2>Title:</h2>
                <p>{service.title}</p>
              </DetailItem>
              <DetailItem>
                <h2>Category:</h2>
                <p>{service.category}</p>
              </DetailItem>
            
              <DetailItem>
                {serviceSchedule.map((scheduleItem) => (
                  <p key={scheduleItem.id}>{format(new Date(scheduleItem.date_time), 'yyyy.MM.dd HH:mm') + ' val.'}</p>
                ))}
              </DetailItem>

              <DetailItem>
                <h2>Rating:</h2>
                <p>{service.rating}</p>
              </DetailItem>
              {isAuthenticated && !isAdmin && (
                <DetailItem>
                  <>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/services/${id}/addreview`);
                      }}
                    >
                      Add Review
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/services/${id}/register`);
                      }}
                    >
                      Register
                    </Button>
                  </>
                </DetailItem>
              )}
            </Details>
            {service.image && (
              <ImageContainer>
                <Image src={service.image} alt={service.title} />
              </ImageContainer>
            )}
          </>
        )}
      </ServiceDetailsContainer>
    </PageContainer>
  );
};

export default ServiceDetails;
