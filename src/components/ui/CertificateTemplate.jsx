/**
 * Certificate Template Component - Matches backend design exactly
 * Uses the proven design from certificateTemplate.js
 */
export const CertificateTemplate = ({ 
  userName, 
  courseTitle, 
  completionDate, 
  certificateId, 
  instructorName 
}) => {
  return (
    <div style={{
      fontFamily: 'Georgia, "Times New Roman", serif',
      background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        width: '100%',
        maxWidth: '1000px',
        padding: '60px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        borderRadius: '8px'
      }}>
        {/* Certificate Border */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          bottom: '20px',
          border: '4px solid #667eea',
          borderRadius: '4px',
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            bottom: '8px',
            border: '2px solid #a29bfe',
            borderRadius: '2px'
          }}></div>
        </div>

        {/* Certificate Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center'
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{
              fontSize: '32px',
              color: '#667eea',
              fontWeight: 'bold',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: 0
            }}>🎓 SkillCerts</h1>
          </div>

          {/* Certificate Title */}
          <div style={{ marginBottom: '10px' }}>
            <h2 style={{
              fontSize: '56px',
              color: '#2d3436',
              fontWeight: 'bold',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '10px',
              margin: 0
            }}>Certificate</h2>
            <div style={{
              fontSize: '24px',
              color: '#636e72',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '30px'
            }}>of Completion</div>
          </div>

          {/* Divider */}
          <div style={{
            width: '200px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #667eea, transparent)',
            margin: '30px auto'
          }}></div>

          {/* Awarded To */}
          <p style={{
            fontSize: '18px',
            color: '#636e72',
            marginBottom: '15px',
            fontStyle: 'italic'
          }}>This certificate is proudly presented to</p>

          {/* Recipient Name */}
          <h3 style={{
            fontSize: '48px',
            color: '#667eea',
            fontWeight: 'bold',
            marginBottom: '25px',
            padding: '0 20px',
            textTransform: 'capitalize',
            margin: '0 0 25px 0'
          }}>{userName}</h3>

          {/* Completion Text */}
          <p style={{
            fontSize: '18px',
            color: '#636e72',
            marginBottom: '20px',
            lineHeight: '1.6'
          }}>for successfully completing the online course</p>

          {/* Course Name */}
          <div style={{
            fontSize: '32px',
            color: '#667eea',
            fontWeight: 'bold',
            margin: '20px 0 40px',
            padding: '0 40px',
            lineHeight: '1.4'
          }}>{courseTitle}</div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '60px',
            padding: '0 40px'
          }}>
            {/* Date Section */}
            <div style={{
              flex: 1,
              textAlign: 'left'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#636e72',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>Date of Completion</div>
              <div style={{
                fontSize: '18px',
                color: '#2d3436',
                fontWeight: 'bold'
              }}>{completionDate}</div>
            </div>

            {/* Signature Section */}
            <div style={{
              flex: 1,
              textAlign: 'right'
            }}>
              <div style={{
                width: '200px',
                height: '2px',
                background: '#2d3436',
                margin: '0 0 8px auto'
              }}></div>
              <div style={{
                fontSize: '18px',
                color: '#2d3436',
                fontWeight: 'bold'
              }}>{instructorName}</div>
              <div style={{
                fontSize: '14px',
                color: '#636e72',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginTop: '8px'
              }}>Course Instructor</div>
            </div>
          </div>

          {/* Certificate ID */}
          <div style={{
            marginTop: '50px',
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '2px dashed #dfe6e9'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#b2bec3',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '5px'
            }}>Certificate ID</div>
            <div style={{
              fontSize: '14px',
              color: '#636e72',
              fontFamily: '"Courier New", monospace',
              fontWeight: 'bold'
            }}>{certificateId}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
