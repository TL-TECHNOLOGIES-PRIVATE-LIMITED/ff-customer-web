import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';
// import { Facebook, Instagram, Youtube, Twitter, Phone, Mail, MapPin } from 'lucide-react';

// CSS styles - you would typically put this in a separate CSS file
const styles = `
.footer {
  background-color: #1a1e21;
  color: #ffffff;
  padding: 60px 0;
}
.footer-links {
  list-style: none;
  padding: 0;
}
.footer-links li a {
  color: #6c757d;
  text-decoration: none;
  transition: color 0.3s;
}
.footer-links li a:hover {
  color: #ffffff;
}
.store-info {
  color: #6c757d;
}
.social-links a {
  color: #6c757d;
  margin-right: 15px;
  font-size: 18px;
  transition: color 0.3s;
}
.social-links a:hover {
  color: #ffffff;
}
.payment-methods span {
  background-color: #343a40;
  width: 40px;
  height: 25px;
  display: inline-block;
  margin-right: 5px;
  border-radius: 4px;
}
.footer-bottom {
  border-top: 1px solid #343a40;
  margin-top: 40px;
  padding-top: 20px;
}
.app-badge {
  height: 40px;
  margin-right: 10px;
  margin-bottom: 10px;
}
`;

const NewFooter = () => {
    return (
        <>
            <style>{styles}</style>
            <footer className="footer">
                <Container>
                    {/* App Download Section */}
                    <Row className="mb-5">
                        <Col md={12}>
                            <h2 className="mb-3">Download Our App Today!</h2>
                            <p className="text-secondary mb-4">
                                Experience the convenience of shopping on-the-go. Enjoy exclusive deals,
                                seamless browsing, and secure payments with our user-friendly mobile app.
                            </p>
                            <div>
                                <img src="/api/placeholder/160/48" alt="Get it on Google Play" className="app-badge" />
                                <img src="/api/placeholder/160/48" alt="Download on the App Store" className="app-badge" />
                            </div>
                        </Col>
                    </Row>

                    <Row>
                        {/* Quick Links */}
                        <Col md={3} sm={6} className="mb-4">
                            <h3>Quick Links</h3>
                            <ListGroup variant="flush" className="footer-links">
                                {['Home', 'About Us', 'FAQs', 'Contact Us'].map((link) => (
                                    <ListGroup.Item key={link} className="bg-transparent border-0 px-0">
                                        <a href="#">{link}</a>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>

                        {/* Company Policies */}
                        <Col md={3} sm={6} className="mb-4">
                            <h3>Company Policies</h3>
                            <ListGroup variant="flush" className="footer-links">
                                {[
                                    'Terms & Condition',
                                    'Privacy Policy',
                                    'Return & Exchanges Policy',
                                    'Shipping Policy',
                                    'Cancellation Policy'
                                ].map((policy) => (
                                    <ListGroup.Item key={policy} className="bg-transparent border-0 px-0">
                                        <a href="#">{policy}</a>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>

                        {/* Store Info */}
                        <Col md={6} className="mb-4">
                            <h3>Store Info</h3>
                            <ListGroup variant="flush" className="footer-links">
                                <ListGroup.Item className="bg-transparent border-0 px-0 d-flex">
                                    {/* <MapPin className="me-2 flex-shrink-0" /> */}
                                    <span className="store-info">
                                        #262-263, Time Square Empire, SH 42 Mirjapar Highway,
                                        Bhuj - Kutch 370001 Gujarat India.
                                    </span>
                                </ListGroup.Item>
                                <ListGroup.Item className="bg-transparent border-0 px-0">
                                    {/* <Mail className="me-2" /> */}
                                    <a href="mailto:eGrocersupport@gmail.com">eGrocersupport@gmail.com</a>
                                </ListGroup.Item>
                                <ListGroup.Item className="bg-transparent border-0 px-0">
                                    {/* <Phone className="me-2" /> */}
                                    <a href="tel:+910987654321">+91 0987654321</a>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>
                    </Row>

                    {/* Footer Bottom */}
                    <div className="footer-bottom">
                        <Row className="align-items-center">
                            <Col md={6} className="mb-3 mb-md-0">
                                <div className="d-flex align-items-center">
                                    <h4 className="mb-0 me-3">Follow Us</h4>
                                    <div className="social-links">
                                        {/* <a href="#"><Facebook /></a>
                                        <a href="#"><Instagram /></a>
                                        <a href="#"><Youtube /></a>
                                        <a href="#"><Twitter /></a> */}
                                    </div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="d-flex align-items-center justify-content-md-end">
                                    <span className="me-2 text-secondary">We Accept</span>
                                    <div className="payment-methods">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <span key={i} className="payment-method"></span>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        <Row className="mt-4">
                            <Col className="text-center text-secondary">
                                Copyright © 2024 All Rights Reserved & Designed by WRTeam.
                            </Col>
                        </Row>
                    </div>
                </Container>
            </footer>
        </>
    );
};

export default NewFooter;