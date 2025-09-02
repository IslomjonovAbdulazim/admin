import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { groupsService } from '../../services/groups';
import { usersService } from '../../services/users';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { formatDate, getErrorMessage } from '../../utils/helpers';
import './GroupMembers.css';

const GroupMembers = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [group, setGroup] = useState(location.state?.group || null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersResponse, studentsResponse] = await Promise.all([
        groupsService.members.getAll(groupId),
        usersService.students.getAll(1, 1000, '')
      ]);
      
      if (membersResponse.success) {
        setGroupMembers(membersResponse.data || []);
      } else {
        setError('Guruh aʻzolarini yuklashda xatolik yuz berdi');
      }
      
      if (studentsResponse.success) {
        setAllStudents(studentsResponse.data.items || []);
      } else {
        setError('Talabalarni yuklashda xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Maʻlumotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleAddMember = async (studentId) => {
    try {
      const response = await groupsService.members.addSingle(groupId, studentId);
      if (response.success) {
        const membersResponse = await groupsService.members.getAll(groupId);
        if (membersResponse.success) {
          setGroupMembers(membersResponse.data || []);
        }
      } else {
        setError(response.detail || 'Talabani guruhga qoʻshishda xatolik yuz berdi');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleRemoveMember = async (studentId) => {
    if (!window.confirm('Bu talabani guruhdan oʻchirishni xohlaysizmi?')) {
      return;
    }

    try {
      const response = await groupsService.members.remove(groupId, studentId);
      if (response.success) {
        const membersResponse = await groupsService.members.getAll(groupId);
        if (membersResponse.success) {
          setGroupMembers(membersResponse.data || []);
        }
      } else {
        setError(response.detail || 'Talabani guruhdan oʻchirishda xatolik yuz berdi');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const filteredAvailableStudents = allStudents.filter(student => 
    !groupMembers.some(member => member.profile_id === student.id) &&
    (studentSearchQuery === '' || 
     student.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
     student.phone.includes(studentSearchQuery))
  );

  if (loading) {
    return (
      <div className="group-members-page">
        <div className="loading-container">
          <LoadingSpinner />
          <p>Maʻlumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-members-page">
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn btn-sm btn-primary ml-10" onClick={loadData}>
            Qayta urinish
          </button>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <button 
            className="btn btn-secondary btn-back"
            onClick={() => navigate('/groups')}
          >
            ← Guruhlar
          </button>
          <div>
            <h2>Guruh aʻzolari - {group?.name || location.state?.groupName || `Guruh #${groupId}`}</h2>
            <p>Guruh aʻzolarini boshqaring va yangi talabalar qoʻshing</p>
          </div>
        </div>
      </div>

      <div className="group-members-content">
        <div className="members-grid">
          {/* Current Members */}
          <div className="members-section current-members">
            <div className="section-header">
              <h3>Guruh aʻzolari ({groupMembers.length})</h3>
            </div>
            {groupMembers.length === 0 ? (
              <div className="empty-state">
                <p>Bu guruhda hali talabalar yoʻq</p>
              </div>
            ) : (
              <div className="members-list">
                {groupMembers
                  .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                  .map(member => (
                  <div key={member.profile_id} className="member-row">
                    <div className="member-rank-col">
                      {member.rank && (
                        <span className={`member-rank rank-${member.rank <= 3 ? member.rank : 'other'}`}>
                          #{member.rank}
                        </span>
                      )}
                    </div>
                    <div className="member-info-col">
                      <div className="member-name">{member.full_name}</div>
                      <div className="member-phone">{member.phone || 'Telefon koʻrsatilmagan'}</div>
                    </div>
                    <div className="member-points-col">
                      <span className="member-points">
                        🪙 {member.total_coins || 0}
                      </span>
                    </div>
                    <div className="member-actions-col">
                      <div className="dropdown">
                        <button
                          className="dropdown-toggle"
                          onClick={() => setDropdownOpen(dropdownOpen === member.profile_id ? null : member.profile_id)}
                        >
                          ⋯
                        </button>
                        {dropdownOpen === member.profile_id && (
                          <div className="dropdown-menu">
                            <button
                              className="dropdown-item danger"
                              onClick={() => {
                                setDropdownOpen(null);
                                handleRemoveMember(member.profile_id);
                              }}
                            >
                              Olib tashlash
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Students to Add */}
          <div className="members-section available-students">
            <div className="section-header">
              <h3>Mavjud talabalar</h3>
              <div className="search-bar">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Talabalarni qidiring..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {filteredAvailableStudents.length === 0 ? (
              <div className="empty-state">
                <p>
                  {studentSearchQuery 
                    ? 'Qidiruv boʻyicha talabalar topilmadi' 
                    : 'Guruhga qoʻshish uchun talabalar yoʻq'
                  }
                </p>
              </div>
            ) : (
              <div className="students-list">
                {filteredAvailableStudents.map(student => (
                  <div key={student.id} className="student-row">
                    <div className="student-info-col">
                      <div className="student-name">{student.full_name}</div>
                      <div className="student-phone">{student.phone}</div>
                    </div>
                    <div className="student-actions-col">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAddMember(student.id)}
                        title="Guruhga qoʻshish"
                      >
                        Qoʻshish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;