// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
  Button,
  CompoundButton,
  Spinner,
  ProgressBar,
} from '@fluentui/react-components';
import booksList from './books.json';

function Reader({ book, pageIdx, onPrev, onNext }) {
  const page = book.pages[pageIdx];
  const [animated, setAnimated] = useState(false);

  // Reset animation when page changes
  useEffect(() => {
    setAnimated(false);
  }, [pageIdx]);

  // Base style from JSON.initial
  const baseStyle = {
    position: 'absolute',
    transition: 'all 0.5s ease',
    cursor: 'pointer',
    top:    page.interactive.initial?.top    ?? '50%',
    left:   page.interactive.initial?.left   ?? '50%',
    width:  page.interactive.initial?.width  ?? 80,
    height: page.interactive.initial?.height ?? 80,
    transform: page.interactive.initial?.transform ?? 'translate(-50%, -50%)',
  };

  // Apply JSON.animation when clicked
  const interactiveStyle = animated
    ? (() => {
        const anim = page.interactive.animation;
        switch (anim.type) {
          case 'move':
            return { ...baseStyle, top: anim.to.top, left: anim.to.left };
          case 'grow':
            return {
              ...baseStyle,
              transform: `translate(-50%, -50%) scale(${anim.scale ?? 1.5})`,
            };
          case 'shrink':
            return {
              ...baseStyle,
              transform: `translate(-50%, -50%) scale(${anim.scale ?? 0.5})`,
            };
          case 'color':
            return {
              ...baseStyle,
              filter: `hue-rotate(${anim.hue ?? 90}deg)`,
            };
          default:
            return baseStyle;
        }
      })()
    : baseStyle;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 112px)', // leave room for header+footer
        overflow: 'hidden',
      }}
    >
      {/* Background at zIndex 0 */}
      <img
        src={page.background}
        alt="Background"
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Interactive object at zIndex 1 */}
      <img
        src={page.interactive.src}
        alt="Interactive"
        onClick={() => setAnimated(true)}
        style={{
          ...interactiveStyle,
          zIndex: 1,
          pointerEvents: 'auto',
        }}
      />

      {/* Prev / Next controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Button onClick={onPrev} disabled={pageIdx === 0} style={{ margin: '0 1rem' }}>
          Prev
        </Button>
        <Button
          onClick={onNext}
          disabled={pageIdx === book.pages.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('list');
  const [books] = useState(booksList);
  const [currentBook, setCurrentBook] = useState(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const openBook = async (id) => {
    setIsLoading(true);
    const module = await import(`./books/${id}.json`);
    setCurrentBook(module.default);
    setPageIdx(0);
    setView('reader');
    setIsLoading(false);
  };

  const prevPage = () => setPageIdx((p) => Math.max(p - 1, 0));
  const nextPage = () => {
    if (currentBook) {
      setPageIdx((p) => Math.min(p + 1, currentBook.pages.length - 1));
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      {/* NAV BAR */}
      <header
        style={{
          background: '#0063B1',
          padding: '0.5rem 1rem',
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Back arrow (steps back in reader) */}
          <Button
            appearance="subtle"
            onClick={() => { if (view === 'reader') prevPage(); }}
            disabled={view !== 'reader' || pageIdx === 0}
            style={{ color: '#FFFFFF' }}
          >
            ←
          </Button>

          {/* Home button */}
          <Button
            appearance="subtle"
            onClick={() => setView('list')}
            style={{ color: '#FFFFFF' }}
          >
            Home
          </Button>

          {/* Title */}
          <Text
            as="h2"
            variant="large"
            block
            style={{ flex: 1, textAlign: 'center', margin: 0 }}
          >
            {view === 'reader' && currentBook
              ? currentBook.title
              : 'Storybook Reader'}
          </Text>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        style={{
          padding: '2rem',
          background: '#F3F2F1',
          minHeight: 'calc(100vh - 112px)',
          overflow: 'auto',
        }}
      >
        {view === 'list' && (
          <>
            <Text as="h3" variant="large" block>
              Select a Book
            </Text>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              {books.map((book) => (
                <CompoundButton
                  key={book.id}
                  secondaryContent="Read now"
                  onClick={() => openBook(book.id)}
                  style={{
                    width: 200,
                    textAlign: 'left',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    borderRadius: 4,
                  }}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    style={{
                      width: '100%',
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 4,
                      marginBottom: 8,
                    }}
                  />
                  {book.title}
                </CompoundButton>
              ))}
            </div>
          </>
        )}

        {view === 'reader' && currentBook && (
          <>
            {isLoading ? (
              <Spinner label="Loading book..." />
            ) : (
              <Reader
                book={currentBook}
                pageIdx={pageIdx}
                onPrev={prevPage}
                onNext={nextPage}
              />
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          background: '#FFFFFF',
          padding: '0.5rem 1rem',
          borderTop: '1px solid #E1DFDD',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {view === 'reader' && currentBook ? (
          <>
            <ProgressBar
              value={(pageIdx + 1) / currentBook.pages.length}
              style={{ flex: 1 }}
            />
            <Text block>
              {pageIdx + 1} / {currentBook.pages.length}
            </Text>
          </>
        ) : (
          <Text variant="body2" block>
            My Storybook App © 2025
          </Text>
        )}
      </footer>
    </FluentProvider>
);
}
