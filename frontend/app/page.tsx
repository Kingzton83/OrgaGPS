'use client';
declare global {
  interface Window {
    onHCaptchaSuccess: (token: string) => void;
  }
}

export {};
import React, { useEffect, useState } from 'react';
import './globals.css';
import Image from 'next/image';
import { DataFetcher } from './components/get_data';


export default function Home() {
  const [hcaptchaToken, setHcaptchaToken] = useState("");
  const dataFetcher = new DataFetcher();
  const token = dataFetcher.token;

  useEffect(() => {
    window.onHCaptchaSuccess = function (token: string) {
      console.log("hCaptcha erfolgreich", token);
      setHcaptchaToken(token);
    };
  }, []);

  const TopBlock = () => (
    <div className="home-header">
      <div className="text">
        <p>
          <span style={{ fontWeight: 'bold', fontSize: '1.5em', textAlign: 'left', display: 'block' }}>
            GPS and RFID-tag<br />
            attendance tracking
          </span>
          <br />
          <span style={{ textAlign: 'left', display: 'block' }}>
            Effortless scheduling.<br />
            Efficient time management.<br />
            Total control.
          </span>
          <br />
          <span style={{ fontWeight: 'bold', fontSize: '1.5em', textAlign: 'center', display: 'block' }}>
            100% FREE!
          </span>
        </p>
        <button className="dark-btn" style={{ fontSize: '22px'}} onClick={() => openOverlay("signup")}>REGISTER NOW!</button>
        </div>
    </div>
  );

  const Features = () => {
    const lis = [
      { text: "Real-time tracking for better oversight.", image: "/images/homepage/streamline_workflow/1.png" },
      { text: "Easy shift planning with just a few clicks.", image: "/images/homepage/streamline_workflow/2.png" },
      { text: "Clear tasks, better results.", image: "/images/homepage/streamline_workflow/3.png" },
      { text: "Leverage data for smarter decisions.", image: "/images/homepage/streamline_workflow/4.png" }
    ];

    return (
      <div className="features-div">
        <h3>Streamline your workflow, simplify time management.</h3>
        <ul className="features">
          {lis.map((feature: any, index: number) => (
            <li key={index} className={index % 2 === 0 ? "even" : "odd"}>
              <Image src={feature.image} width={500} height={500} alt="img" layout="responsive" />
              <p>{feature.text}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const Vision = () => {
    const visionContent = [
      {
        image: "/images/homepage/vision/1.png",
        text: (
          <>
            <span style={{ fontWeight: 'bold', fontSize: '24px', textAlign: 'left', paddingBottom: '15px', display: 'inline-block' }}>
              Revolutionizing Time and Task Management
            </span>
            <br />
            <span style={{ fontWeight: 'bold', color: "#4BC6B9", paddingBottom: '10px', display: 'inline-block', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.1)'}}>
              We aim to simplify how people organize their time and tasks, whether for personal use or within a business.
            </span>
            <br />
              Our intuitive GPS system revolutionizes team attendance tracking, making it effortless and efficient. Save valuable time, improve productivity, and streamline operations with a solution tailored for seamless convenience and success.
          </>
        ),
      },
      {
        image: "/images/homepage/vision/2.png",
        text: (
          <>
            <span style={{ fontWeight: 'bold', fontSize: '24px', textAlign: 'left', paddingBottom: '15px', display: 'inline-block'}}>
              Effortless Scheduling with GPS Precision
            </span>
            <br />
            <span style={{ fontWeight: 'bold', color: "#4BC6B9", paddingBottom: '10px', display: 'inline-block', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.1)'}}>
              Our flexible scheduling tool is perfect for companies and individuals, empowering you to stay effortlessly on top of your plans.
            </span>
            <br />
              With seamless GPS check-ins, team attendance becomes a breeze. Simplify shift management, enhance team collaboration, and ensure your operations run smoothly every single day.</>
        ),
      },
      {
        image: "/images/homepage/vision/3.png",
        text: (
          <>
            <span style={{ fontWeight: 'bold', fontSize: '24px', textAlign: 'left', paddingBottom: '15px', display: 'inline-block' }}>
              Simple Attendance Tracking
            </span>
            <br />
            <span style={{ fontWeight: 'bold', color: "#4BC6B9", paddingBottom: '10px', display: 'inline-block', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.1)' }}>
              With a simple tap on their phones, team members can confirm their presence at designated GPS locations, making attendance tracking effortless and accurate.
            </span>
            <br />
              Employers can easily monitor timeliness and presence, ensuring smooth operations. Reliable tools streamline workflows for maximum efficiency and satisfaction every day.            </>
        ),
      },
      {
        image: "/images/homepage/vision/4.png",
        text: (
          <>
            <span style={{ fontWeight: 'bold', fontSize: '24px', textAlign: 'left', paddingBottom: '15px', display: 'inline-block' }}>
            Simplifying Commitments with OrgaGPS
            </span>
            <br />
            <span style={{ fontWeight: 'bold', color: "#4BC6B9", paddingBottom: '10px', display: 'inline-block', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.1)'}}>
              OrgaGPS supports companies in maintaining smooth operations while helping individuals manage commitments with ease.
            </span>
            <br />
              With tools designed for simplicity and reliability, we empower smarter decisions through detailed data insights. Streamline workflows and enhance daily efficiency, bringing clarity and control to every task.            </>
        ),
      },
    ];
  
    return (
      <div className="vision" id="vision">
        <h3>At OrgaGPS!</h3>
        <div className="vision-columns">
          {visionContent.map((item, index) => (
            <div
              key={index}
              className={`vision-row ${index % 2 === 0 ? "" : "reverse"}`}
            >
              <div className="vision-text">
                <p>{item.text}</p>
              </div>
              <div className="vision-image">
                <Image
                  src={item.image}
                  width={200}
                  height={200}
                  alt={`Vision ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FAQSection = () => {
    const [selectedIndex, setSelectedIndex] = useState(null);
  
    const handleQuestionClick = (index: any) => {
      setSelectedIndex(selectedIndex === index ? null : index);
    };
  
    return (
      <div className="faq-container" id="faq">
        <h3>FAQs</h3>
        <div className="faq-columns">
          {faq.map((item, index) => (
            <div key={index} className="faq-column">
              <div
                className={`faq-question ${selectedIndex === index ? 'active' : ''}`}
                onClick={() => handleQuestionClick(index)}
              >
                {item.question}
              </div>
              {selectedIndex === index && (
                <div className="faq-answer">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  

  const faq = [
    {
        question: "What is OrgaGPS?",
        answer: "OrgaGPS is a tool that helps businesses simplify attendance tracking, task management, and shift planning using GPS technology. It streamlines workflows, ensuring productivity and organization."
    },
    {
        question: "How does OrgaGPS track attendance?",
        answer: "OrgaGPS uses GPS to enable employees to clock in and out from approved locations. This ensures accurate attendance records while maintaining transparency and avoiding errors in manual tracking."
    },
    {
        question: "Is OrgaGPS free to use?",
        answer: "Yes! OrgaGPS is 100% free. There are no hidden costs or fees. Simply start working."
    },
    {
        question: "Is my data secure with OrgaGPS?",
        answer: "OrgaGPS ensures data security with encryption during storage and transmission. Regular backups and restricted access policies are in place to maintain the highest level of protection."
    },
    {
        question: "Can OrgaGPS handle multiple locations?",
        answer: "Yes, OrgaGPS is designed for businesses operating in multiple locations, enabling accurate GPS-based tracking, shift management, and task coordination across various branches."
    },
    {
        question: "Does OrgaGPS integrate with other tools?",
        answer: "OrgaGPS does not integrate with any other tools, programs or apps."
    },
    {
        question: "How can I contact OrgaGPS support?",
        answer: "For support, email us at support@orgagps.com or use the in-app messaging feature for prompt assistance. Our team is available to help with any questions or concerns."
    },
    {
        question: "Can I customize OrgaGPS for my business needs?",
        answer: "Yes, OrgaGPS offers customizable options, including branding, tailored reports, and adjustable shift rules, making it adaptable to the unique needs of your organization."
    },
    {
        question: "How do I reset my password?",
        answer: "Reset your password by clicking 'Forgot Password' on the login page. Follow the email instructions sent to you for a secure password reset and regain access to your account."
    },
    {
        question: "Does OrgaGPS support remote teams?",
        answer: "Yes, OrgaGPS is perfect for remote teams, enabling members to clock in, manage shifts, and collaborate seamlessly, whether they work in an office, at home, or on the go."
    },
    {
        question: "How can I cancel or delete my account?",
        answer: "Cancel your subscription via the web app’s settings or request account deletion by contacting support@orgagps.com. Deletions are processed promptly and confirmed via email."
    },
    {
        question: "What devices does OrgaGPS support?",
        answer: "OrgaGPS is compatible with iOS and Android devices, as well as desktop browsers, ensuring that you and your team can access the platform from anywhere, anytime."
    }
  ];


  const AboutUs = () => (
    <div className="about-us" id="aboutus">
      <h3 className="about-us-title">About us</h3>
        <p>We are a team of three developers who came together to create OrgaGPS as our joint final project for our studies. Initially, our mission was to assist friends managing a foundation by providing them with a tool to optimize their staff organization.
        <br></br><br></br>
        Seeing the transformative impact it had, we decided to make OrgaGPS available to the world. OrgaGPS is a user-friendly software designed to enhance time management and personnel scheduling for organizations and businesses alike. Our passion for technology and desire to develop meaningful solutions drove us to not only assist our friends but also to empower a global audience. 
        <br></br><br></br>
        By integrating advanced scheduling tools and real-time tracking capabilities, OrgaGPS ensures that managing daily tasks and team coordination is effortless and efficient. We believe in making sophisticated technology accessible and useful for improving everyday operations. Through OrgaGPS, we aim to help more people and organizations overcome their daily challenges with greater ease and effectiveness.
        </p>
    </div>
  );

  const Widget = () => (
    <div className="bottom-widget">
      <div className="widget-container">
        <div className="widget-left">
          <p style={{ fontSize: "2em", fontWeight: "bold", color: "#FFFDFD", marginBottom: "0px" }}>
            Join OrgaGPS Today!
          </p>
          <p style={{ fontSize: "1.5em", color: "#FFFDFD", marginBottom: "30px" }}>
            Discover how our tools can <span style={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>simplify</span> your team's <span style={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>workflow and</span> help you <span style={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>achieve</span> your <span style={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>goals</span> effortlessly and <span style={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>for free</span>.
          </p>
          <p>
          <button className="white-btn" style={{ fontSize: '22px', fontWeight: 'bold'}} onClick={() => openOverlay("signup")}>REGISTER NOW!</button>
          </p>
        </div>
        <div className="widget-right">
          <Image src="/images/lady_cell.png" alt="Widget Image" width={340} height={450} />
        </div>
      </div>
    </div>
  );

  return (
    <main className="home-main">
      <TopBlock />
      <Features />
      <Vision />
      <FAQSection />
      <AboutUs />
      <Widget />
    </main>
  );
}
