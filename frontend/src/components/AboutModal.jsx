import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AboutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          overflowY: 'auto'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, rgba(18, 18, 18, 0.98) 0%, rgba(30, 30, 30, 0.98) 100%)',
            border: '2px solid var(--reef-purple)',
            borderRadius: '20px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(112, 67, 255, 0.3)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid var(--card-border)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>

          {/* Content */}
          <div style={{ paddingRight: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }} className="gradient-text">
              🔥 REEF BURNER
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Public Testing Phase - Official Documentation
            </p>

            <hr style={{ border: '1px solid var(--card-border)', margin: '2rem 0' }} />

            {/* What is REEF BURNER */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--reef-pink)' }}>
                🎯 What is REEF BURNER?
              </h2>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                REEF Burner is a <strong>deflationary lottery protocol</strong> that permanently burns REEF tokens while rewarding participants:
              </p>
              <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li><strong>65% Burned Forever</strong> → Sent to 0x000...dEaD (verifiable on-chain)</li>
                <li><strong>27% Prize Pool</strong> → Winner selected via weighted lottery</li>
                <li><strong>8% Development</strong> → Sustainable project funding</li>
              </ul>
              <p style={{ fontWeight: '600', color: 'var(--reef-purple)' }}>
                Every burn makes REEF more scarce. Every participant has a chance to win big.
              </p>
            </section>

            {/* Testing Parameters */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--warning)' }}>
                ⚠️ TESTING PARAMETERS (1-2 Weeks)
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                For safety during testing, we've adjusted the parameters:
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
                    <th style={{ padding: '0.8rem', textAlign: 'left' }}>Parameter</th>
                    <th style={{ padding: '0.8rem', textAlign: 'left' }}>Testing Value</th>
                    <th style={{ padding: '0.8rem', textAlign: 'left' }}>Production Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '0.8rem' }}>Min Burn</td>
                    <td style={{ padding: '0.8rem', color: 'var(--reef-pink)', fontWeight: '600' }}>5 REEF</td>
                    <td style={{ padding: '0.8rem' }}>950 REEF</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '0.8rem' }}>Max Burn</td>
                    <td style={{ padding: '0.8rem', color: 'var(--reef-pink)', fontWeight: '600' }}>8 REEF</td>
                    <td style={{ padding: '0.8rem' }}>1,500 REEF</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.8rem' }}>Lottery Duration</td>
                    <td style={{ padding: '0.8rem', color: 'var(--reef-pink)', fontWeight: '600' }}>1 Hour</td>
                    <td style={{ padding: '0.8rem' }}>3 Days</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <strong>Testing Period:</strong> 1-2 weeks (based on community feedback)<br/>
                <strong>After successful testing:</strong> We'll switch to production parameters
              </p>
            </section>

            {/* Critical Security */}
            <section style={{ marginBottom: '2rem', background: 'rgba(245, 101, 101, 0.1)', border: '2px solid var(--danger)', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--danger)' }}>
                🔐 CRITICAL SECURITY NOTICE
              </h2>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--danger)' }}>
                ⚠️ USE A TEST WALLET - DO NOT USE YOUR MAIN WALLET!
              </h3>
              <p style={{ marginBottom: '1rem', fontWeight: '600' }}>Before participating:</p>
              <ol style={{ marginLeft: '1.5rem', marginBottom: '1rem', lineHeight: '1.8' }}>
                <li>Create a <strong>NEW wallet</strong> in Reef Wallet extension</li>
                <li>Transfer <strong>only 50-100 REEF</strong> to this test wallet</li>
                <li><strong>NEVER use your main wallet</strong> with significant funds</li>
                <li>Test with <strong>small amounts</strong> during this phase</li>
              </ol>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>How to Create a Test Wallet:</p>
                <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8', fontSize: '0.95rem' }}>
                  <li>Open <strong>Reef Wallet</strong> extension</li>
                  <li>Click <strong>"+"</strong> → <strong>"Create New Account"</strong></li>
                  <li>Name it <strong>"REEF BURNER TEST"</strong></li>
                  <li><strong>Save the seed phrase</strong> securely</li>
                  <li>Transfer <strong>50-100 REEF</strong> from your main wallet</li>
                  <li>Use <strong>ONLY this wallet</strong> for testing</li>
                </ol>
              </div>
            </section>

            {/* Official Links */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--reef-blue)' }}>
                ✅ Official Links
              </h2>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '1rem' }}>
                <p style={{ marginBottom: '0.5rem' }}><strong>🌐 dApp:</strong> <a href="https://reef-burner-dapp.vercel.app/" style={{ color: 'var(--reef-pink)' }}>https://reef-burner-dapp.vercel.app/</a></p>
                <p style={{ marginBottom: '0.5rem' }}><strong>📜 Contract V2:</strong> <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>0x44392f3FCeb4bd22d8b4DDc4569aDBed3ec7d472</code></p>
                <p style={{ marginBottom: '0.5rem' }}><strong>🔍 ReefScan:</strong> <a href="https://reefscan.com/contract/0x44392f3FCeb4bd22d8b4DDc4569aDBed3ec7d472" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--reef-pink)' }}>Verify Contract</a></p>
                <p><strong>💾 GitHub:</strong> <a href="https://github.com/XenobuD/reef-burner-dapp" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--reef-pink)' }}>Open Source Code</a></p>
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 165, 0, 0.1)', border: '1px solid orange', borderRadius: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'orange' }}>🚨 Beware of Scams!</p>
                <ul style={{ marginLeft: '1.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <li>❌ <strong>NEVER</strong> enter your seed phrase on ANY website</li>
                  <li>❌ <strong>DO NOT</strong> trust clone sites or fake contracts</li>
                  <li>❌ <strong>VERIFY</strong> the contract address before connecting</li>
                  <li>✅ <strong>ALWAYS</strong> check the URL: reef-burner-dapp.vercel.app</li>
                </ul>
              </div>
            </section>

            {/* How to Participate */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--reef-purple)' }}>
                📖 How to Participate
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ background: 'rgba(112, 67, 255, 0.1)', border: '1px solid var(--reef-purple)', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Step 1: Connect Wallet</h4>
                  <ol style={{ marginLeft: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <li>Click "🌊 Connect Wallet"</li>
                    <li>Approve connection in Reef Wallet</li>
                    <li>Your address appears in top-right corner</li>
                  </ol>
                </div>
                <div style={{ background: 'rgba(112, 67, 255, 0.1)', border: '1px solid var(--reef-purple)', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Step 2: Switch to Test Wallet</h4>
                  <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <li>Click your address (if you have multiple accounts)</li>
                    <li>Select your <strong>TEST wallet</strong> from dropdown</li>
                    <li>Verify the correct address is connected</li>
                  </ul>
                </div>
                <div style={{ background: 'rgba(112, 67, 255, 0.1)', border: '1px solid var(--reef-purple)', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Step 3: Burn REEF</h4>
                  <ol style={{ marginLeft: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <li>Enter amount: 5-8 REEF (testing limits)</li>
                    <li>Or click quick buttons: [5] [6] [7] [8]</li>
                    <li>Click "🔥 BURN X REEF 🔥"</li>
                    <li><strong>Review transaction</strong> in Reef Wallet popup</li>
                    <li>Click "Approve" to confirm</li>
                  </ol>
                </div>
                <div style={{ background: 'rgba(112, 67, 255, 0.1)', border: '1px solid var(--reef-purple)', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Step 4: Verify Burn</h4>
                  <ul style={{ marginLeft: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <li>Check ReefScan for your transaction</li>
                    <li>View 0x000...dEaD address to see burned REEF</li>
                    <li>See your entry in "Current Participants" list</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How Lottery Works */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--fire)' }}>
                🎲 How the Lottery Works
              </h2>
              <p style={{ marginBottom: '1rem', fontWeight: '600' }}>Weighted Probability System:</p>
              <p style={{ marginBottom: '1rem' }}>The more you burn, the better your odds:</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
                    <th style={{ padding: '0.8rem', textAlign: 'left' }}>Burn Amount</th>
                    <th style={{ padding: '0.8rem', textAlign: 'left' }}>Bonus</th>
                    <th style={{ padding: '0.8rem', textAlign: 'left' }}>Total Multiplier</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '0.8rem' }}>5 REEF</td>
                    <td style={{ padding: '0.8rem' }}>0%</td>
                    <td style={{ padding: '0.8rem' }}>1.00x tickets</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '0.8rem' }}>6 REEF</td>
                    <td style={{ padding: '0.8rem', color: 'var(--reef-pink)' }}>+1%</td>
                    <td style={{ padding: '0.8rem' }}>1.01x tickets</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td style={{ padding: '0.8rem' }}>7 REEF</td>
                    <td style={{ padding: '0.8rem', color: 'var(--reef-pink)' }}>+2%</td>
                    <td style={{ padding: '0.8rem' }}>1.02x tickets</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.8rem' }}>8 REEF</td>
                    <td style={{ padding: '0.8rem', color: 'var(--reef-pink)' }}>+3%</td>
                    <td style={{ padding: '0.8rem', fontWeight: '600' }}>1.03x tickets</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Winner Selection:</p>
                <ul style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
                  <li><strong>Every 5 minutes</strong> (testing) / <strong>3 days</strong> (production)</li>
                  <li><strong>Fully automated</strong> by smart contract</li>
                  <li><strong>Provably fair</strong> - weighted random selection</li>
                  <li><strong>Winner gets entire prize pool</strong> (27% of all burns)</li>
                </ul>
              </div>
            </section>

            {/* Proof of Burn */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--fire)' }}>
                🔥 Proof of Burn
              </h2>
              <p style={{ marginBottom: '1rem' }}>
                All burns are <strong>100% transparent and verifiable</strong> on the blockchain:
              </p>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Verify burns yourself:</p>
                <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
                  <li>Go to: <a href="https://reefscan.com/account/0x000000000000000000000000000000000000dEaD" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--reef-pink)' }}>Dead Address on ReefScan</a></li>
                  <li>See <strong>all burned REEF</strong> from the protocol</li>
                  <li><strong>No one</strong> can access this address - REEF is gone forever!</li>
                </ol>
              </div>
            </section>

            {/* FAQ */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--reef-blue)' }}>
                ❓ FAQ
              </h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Q: Can I lose all my REEF?</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>A: Only what you choose to burn. Use a test wallet with limited funds.</p>
                </div>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Q: How is the winner selected?</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>A: Smart contract uses block hash + weighted random selection. More burned = better odds.</p>
                </div>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Q: Can the owner rug pull?</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>A: No. The contract is immutable. Funds go to: 65% burn, 27% prize, 8% dev. No admin withdrawal function.</p>
                </div>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.3rem' }}>Q: How do I know REEF is actually burned?</p>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>A: Check the dead address on ReefScan - all burns are visible on-chain.</p>
                </div>
              </div>
            </section>

            {/* Contributors & Thanks */}
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--reef-purple)' }}>
                🙏 Contributors & Thanks
              </h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                ReefBurner wouldn't be possible without the help of amazing community members.
              </p>

              {/* Security Contributors */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(112, 67, 255, 0.1) 0%, rgba(255, 67, 185, 0.05) 100%)',
                border: '1px solid rgba(112, 67, 255, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2rem', marginRight: '0.75rem' }}>🛡️</span>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      Security Research
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Critical vulnerability discovery & mitigation
                    </p>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #7043ff 0%, #ff43b9 100%)',
                      borderRadius: '50%',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0
                    }}>
                      👨‍💻
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        LaOnDa
                      </h4>
                      <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        Comprehensive security review identifying critical vulnerabilities:
                      </p>
                      <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', marginLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                        <li>Revealer bias attack prevention</li>
                        <li>DoS protection mechanisms</li>
                        <li>Witnet oracle integration guidance</li>
                        <li>Adversarial testing framework</li>
                      </ul>
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(112, 67, 255, 0.2)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        color: 'var(--reef-purple)',
                        display: 'inline-block'
                      }}>
                        🏆 V4 Security MVP
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Feedback */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2rem', marginRight: '0.75rem' }}>💬</span>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      Community Feedback
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      User experience improvements & bug reports
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    Special thanks to <strong style={{ color: 'var(--reef-pink)' }}>Reef Community members</strong> for:
                  </p>
                  <ul style={{ fontSize: '0.85rem', lineHeight: '1.6', marginLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                    <li>Error handling improvements</li>
                    <li>Mobile detection enhancements</li>
                    <li>UI/UX suggestions</li>
                    <li>Testing & bug reports</li>
                  </ul>
                </div>
              </div>

              {/* Want to Contribute */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(112, 67, 255, 0.05)',
                border: '1px dashed rgba(112, 67, 255, 0.3)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  🌟 <strong>Want to contribute?</strong>
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Report bugs, suggest features, or help improve security on our{' '}
                  <a
                    href="https://github.com/XenobuD/reef-burner-dapp"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--reef-purple)', textDecoration: 'underline' }}
                  >
                    GitHub repository
                  </a>
                </p>
              </div>
            </section>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--card-border)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Built with ❤️ for the Reef Community by <strong style={{ color: 'var(--reef-pink)' }}>XenobuD</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Open Source • Transparent • Verifiable
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem', opacity: 0.6 }}>
                V3 Testing Phase • December 2025
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutModal;
