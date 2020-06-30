import * as path from 'path';
import * as fs from 'fs';
import {
  window,
  OverviewRulerLane,
  DecorationRangeBehavior,
  ExtensionContext,
  TextEditorDecorationType,
  DecorationRenderOptions,
} from 'vscode';
import passingIcon from 'vscode-codicons/src/icons/check.svg';
import failingIcon from 'vscode-codicons/src/icons/chrome-close.svg';
import skipIcon from 'vscode-codicons/src/icons/debug-step-over.svg';
import unknownIcon from 'vscode-codicons/src/icons/question.svg';

export class Decorations {
  private static ICONS_PATH = path.join('out', 'icons');

  private context: ExtensionContext;

  public passing: TextEditorDecorationType;
  public failing: TextEditorDecorationType;
  public skip: TextEditorDecorationType;
  public unknown: TextEditorDecorationType;

  constructor(context) {
    this.context = context;

    this.passing = this.createStateDecoration([['passing', passingIcon, '#35A15E'], 'green']);
    this.failing = this.createStateDecoration([['failing', failingIcon, '#D6443C'], 'red']);
    this.skip = this.createStateDecoration([['skip', skipIcon, '#fed37f'], 'yellow']);
    this.unknown = this.createStateDecoration(
      [['unknown', unknownIcon, '#BBBBBB'], 'darkgrey'],
      [['unknown-light', unknownIcon, '#555555']]
    );
  }

  private resolvePath(...args: string[]): string {
    return this.context.asAbsolutePath(path.join(...args));
  }

  private prepareIcon(state: string, source: string, color?: string): string {
    const resultIconPath = this.resolvePath(Decorations.ICONS_PATH, `${state}.svg`);
    let result = source.toString();

    if (color !== undefined) {
      result = result.replace('fill="currentColor"', `fill="${color}"`);
    }

    if (!fs.existsSync(resultIconPath) || fs.readFileSync(resultIconPath).toString() !== result) {
      if (!fs.existsSync(this.resolvePath(Decorations.ICONS_PATH))) {
        fs.mkdirSync(this.resolvePath(Decorations.ICONS_PATH));
      }

      fs.writeFileSync(resultIconPath, result);
    }

    return resultIconPath;
  }

  private createStateDecoration(
    dark: /* default */ [Parameters<Decorations['prepareIcon']>, string?],
    light?: /* optional overrides */ [Parameters<Decorations['prepareIcon']>, string?]
  ): TextEditorDecorationType {
    const [iconOptions, overviewRulerColor] = dark;
    const icon = this.prepareIcon(...iconOptions);

    const options: DecorationRenderOptions = {
      gutterIconPath: icon,
      gutterIconSize: 'contain',
      overviewRulerLane: OverviewRulerLane.Left,
      rangeBehavior: DecorationRangeBehavior.ClosedClosed,
      dark: {
        gutterIconPath: icon,
      },
      light: {
        gutterIconPath: light !== undefined ? this.prepareIcon(...light[0]) : icon,
      },
    };

    if (overviewRulerColor) {
      options['overviewRulerColor'] = overviewRulerColor;
      options['dark']['overviewRulerColor'] = overviewRulerColor;
    }

    if (light !== undefined && light[1] !== undefined) {
      options['light']['overviewRulerColor'] = light[1];
    }

    return window.createTextEditorDecorationType(options);
  }

  public failingAssertionStyle(text: string): TextEditorDecorationType {
    return window.createTextEditorDecorationType({
      isWholeLine: true,
      overviewRulerColor: 'red',
      overviewRulerLane: OverviewRulerLane.Left,
      light: {
        before: {
          color: '#FF564B',
        },
        after: {
          color: '#FF564B',
          contentText: ' // ' + text,
        },
      },
      dark: {
        before: {
          color: '#AD322D',
        },
        after: {
          color: '#AD322D',
          contentText: ' // ' + text,
        },
      },
    });
  }
}
