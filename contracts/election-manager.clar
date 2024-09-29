(define-constant ERR_NOT_ADMIN (err u102))
(define-constant ERR_INVALID_PHASE (err u103))

(define-data-var election-phase uint u0) ;; 0 = registration, 1 = voting, 2 = closed
(define-constant PHASE_REGISTRATION u0)
(define-constant PHASE_VOTING u1)
(define-constant PHASE_CLOSED u2)

(define-constant ADMIN 'SP2JAT...KX3Z) ;; Replace with admin address

(define-public (start-voting)
  (begin
    (asserts! (is-eq tx-sender ADMIN) ERR_NOT_ADMIN)
    (asserts! (is-eq (var-get election-phase) PHASE_REGISTRATION) ERR_INVALID_PHASE)
    (var-set election-phase PHASE_VOTING)
    (ok true)))

(define-public (end-election)
  (begin
    (asserts! (is-eq tx-sender ADMIN) ERR_NOT_ADMIN)
    (asserts! (is-eq (var-get election-phase) PHASE_VOTING) ERR_INVALID_PHASE)
    (var-set election-phase PHASE_CLOSED)
    (ok true)))

(define-public (add-candidate (candidate-id uint) (name (buff 50)))
  (begin
    (asserts! (is-eq (var-get election-phase) PHASE_REGISTRATION) ERR_INVALID_PHASE)
    (map-set candidates
      ((candidate-id candidate-id))
      ((name name) (voteCount u0)))
    (ok true)))

(define-public (vote (candidate-id uint))
  (asserts! (is-eq (var-get election-phase) PHASE_VOTING) ERR_INVALID_PHASE)
  ;; Call the existing voting logic here
  (let
    (
      (candidate (map-get? candidates ((candidate-id candidate-id))))
      (voter (map-get? voters ((voter tx-sender))))
    )
    (match voter
      some (err ERR_ALREADY_VOTED)
      none
      (match candidate
        some
        (begin
          (map-set voters ((voter tx-sender)) ((hasVoted true)))
          (map-set candidates
            ((candidate-id candidate-id))
            ((name (get name candidate))
             (voteCount (+ (get voteCount candidate) u1))))
          (ok true))
        none (err ERR_CANDIDATE_NOT_FOUND))))))
