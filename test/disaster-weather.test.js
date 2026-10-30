import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  interpretWmoCode,
  calculateFloodRisk,
  calculateStormRisk,
  correlateDisastersWithISS,
  getFallbackDisasters,
  getFallbackWeather
} from '../lib/disasterApi.js';

describe('Disaster & Severe Weather Prediction Engine', () => {
  test('interprets WMO weather codes correctly', () => {
    const clear = interpretWmoCode(0);
    assert.strictEqual(clear.label, 'Clear Sky');
    assert.strictEqual(clear.storm, false);
    assert.strictEqual(clear.flood, false);

    const thunderstorm = interpretWmoCode(95);
    assert.strictEqual(thunderstorm.label, 'Severe Thunderstorm');
    assert.strictEqual(thunderstorm.storm, true);

    const violentStorm = interpretWmoCode(99);
    assert.strictEqual(violentStorm.storm, true);
    assert.strictEqual(violentStorm.flood, true);
  });

  test('predicts flood risk correctly based on rain accumulation', () => {
    const lowRisk = calculateFloodRisk(0, 5, 20);
    assert.strictEqual(lowRisk.level, 'LOW');
    assert.ok(lowRisk.score < 25);

    const highRisk = calculateFloodRisk(20, 60, 100);
    assert.ok(highRisk.score >= 45);
    assert.ok(highRisk.level.includes('FLOOD'));

    const criticalRisk = calculateFloodRisk(30, 85, 200);
    assert.strictEqual(criticalRisk.level, 'CRITICAL FLOOD ALERT');
    assert.strictEqual(criticalRisk.badgeColor, 'rose');
  });

  test('predicts storm and cyclone risks correctly based on wind and barometric pressure', () => {
    const calm = calculateStormRisk(10, 20, 1018, 0);
    assert.strictEqual(calm.level, 'CALM / NOMINAL');

    const severeGale = calculateStormRisk(45, 76, 996, 65);
    assert.strictEqual(severeGale.level, 'SEVERE GALE / TROPICAL STORM');
    assert.strictEqual(severeGale.badgeColor, 'amber');

    const hurricaneForce = calculateStormRisk(95, 135, 965, 99);
    assert.strictEqual(hurricaneForce.level, 'CATEGORY CYCLONE / HURRICANE FORCE');
    assert.strictEqual(hurricaneForce.badgeColor, 'rose');
  });

  test('correlates active natural disasters relative to ISS position', () => {
    const issPos = { latitude: 14.5, longitude: 135.0 };
    const mockDisasters = [
      {
        id: 'CYCLONE-1',
        title: 'Tropical Cyclone',
        category: 'severeStorms',
        latitude: 14.2,
        longitude: 135.6
      },
      {
        id: 'FLOOD-1',
        title: 'Distant Flood Event',
        category: 'floods',
        latitude: -45.0,
        longitude: 10.0
      }
    ];

    const correlated = correlateDisastersWithISS(issPos, mockDisasters);
    assert.strictEqual(correlated.length, 2);
    // Nearest event should be first
    assert.strictEqual(correlated[0].id, 'CYCLONE-1');
    assert.ok(correlated[0].distanceKm < 200);
    assert.strictEqual(correlated[0].isOverflying, true);
    assert.strictEqual(correlated[0].isDirectPath, true);
    assert.ok(correlated[1].distanceKm > 5000);
    assert.strictEqual(correlated[1].isOverflying, false);
  });

  test('provides fallback disaster dataset and weather forecast structure', () => {
    const disasters = getFallbackDisasters();
    assert.ok(Array.isArray(disasters));
    assert.ok(disasters.length >= 3);
    assert.ok(disasters[0].title);
    assert.ok(typeof disasters[0].latitude === 'number');

    const weather = getFallbackWeather(25.0, -80.0);
    assert.ok(weather.temperature !== undefined);
    assert.ok(weather.floodRisk);
    assert.ok(weather.stormRisk);
    assert.strictEqual(weather.dailyForecast.length, 7);
  });
});
